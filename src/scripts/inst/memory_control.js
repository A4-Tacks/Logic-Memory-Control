const is_operable_memory = (
    (exec, mem) => (
        !(mem === null)
        && mem instanceof MemoryBlock.MemoryBuild
        && mem.team == exec.team));

const min = (a, b) => (a < b ? a : b);

const MEM_EMPTY = 0;
const OK_CODE = 0;
const ARGS_COUNT = 5;
const OPTS_WIDTH = 90;
const NAME = "memctrl";


const options = {
    /* args: { name: ["default_value", "build_type"] } */
    mov: {
        /* copy memory */
        args: {
            from: ["cell1", "building"],
            to: ["cell2", "building"],
            dst: ["0", "numi"],
            src: ["0", "numi"],
            count: ["64", "numi"],
        },
        run(exec, args) {
            let [from, to, src, dst, count] =
                [args.from, args.to, args.src, args.dst, args.count];

            // 任意一方不该操作则返回
            if (! (is_operable_memory(exec, from)
                && is_operable_memory(exec, to))) return 1;
            if (count < 0 || src < 0
                || dst < 0) return 2;

            let from_mem = from.memory;
            let to_mem = to.memory;
            let src_len = from_mem.length;
            let dst_len = to_mem.length;

            let src_stop = src + count;
            let dst_stop = dst + count;
            let safe_src_stop = min(src_stop, src_len);
            let safe_dst_stop = min(dst_stop, dst_len);

            if (from_mem === to_mem && dst > src) {
                print("b")
                let [i, j] = [src_stop - 1, dst_stop - 1];
                while (i >= safe_src_stop && j >= safe_dst_stop) {
                    --i; --j;
                }
                while (i >= safe_src_stop && j >= dst)
                    to_mem[j--] = MEM_EMPTY;
                while (i >= src && j >= dst)
                    to_mem[j--] = from_mem[i--];
            } else {
                print("a")
                let [i, j] = [src, dst];
                while (i < safe_src_stop && j < safe_dst_stop)
                    to_mem[j++] = from_mem[i++];
                while (i++ < src_stop && j < safe_dst_stop)
                    to_mem[j++] = MEM_EMPTY;
            }
        },
    },
    rev: {
        /* reverse memory */
        args: {
            from: ["cell1", "building"],
            l: ["0", "numi"],
            r: ["64", "numi"],
        },
        run(exec, args) {
            let from = args.from;
            if (! is_operable_memory(exec, from))
                return 1;
            let [l, r] = [args.l, args.r];
            let mem = from.memory;
            const f = n => (n < 0 || n >= mem.length); // 越界返回错误
            if (f(l) || f(r)) return 2;

            const swap = (a, b) => ([mem[a], mem[b]] = [mem[b], mem[a]]);
            let [i, j] = [l, r];
            while (i < j) swap(i++, j--);
        },
    },
    swap: {
        args: {
            from: ["cell1", "building"],
            a: ["0", "numi"],
            b: ["1", "numi"],
        },
        run(exec, args) {
            let from = args.from;
            if (! is_operable_memory(exec, from))
                return 1;
            let [a, b] = [args.a, args.b];
            let mem = from.memory;
            const f = n => (n < 0 || n >= mem.length); // 越界返回错误
            if (f(a) || f(b)) return 2;
            [mem[a], mem[b]] = [mem[b], mem[a]]; // swap
        },
    },
    swps: {
        /* 使用手摇算法完成多元素不等数交换
            交换区间 [l1, r1] 与 [l2, r2]
         */
        args: {
            from: ["cel11", "building"],
            l1: ["0", "numi"],
            r1: ["16", "numi"],
            l2: ["48", "numi"],
            r2: ["64", "numi"],
        },
        run(exec, args) {
            let [from, l1, r1, l2, r2] = [
                args.from, args.l1, args.r1, args.l2, args.r2,
            ];
            if (! is_operable_memory(exec, from))
                return 1;
            if (r2 <= l1) [l1, r1, l2, r2] = [l2, r2, l1, r1]; // 对于可能 r1 在右边的情况交换
            let mem = from.memory;
            if (0 > l1 || l1 > r1 /* 验证交换是否合法 */
                    || r1 > l2 || l2 > r2
                    || r2 > mem.length) return 2;
            const rev = (l, r) => {
                let [i, j] = [l, r];
                while (i < j) {
                    [mem[i], mem[j]] = [mem[j], mem[i]];
                    ++i; --j;
                }
            };
            rev(l1, r1);
            rev(l2, r2);
            rev(r1 + 1, l2 - 1);
            rev(l1, r2);
        },
    },
    fill: {
        args: {
            from: ["cell1", "building"],
            num: ["0", "num"],
            addr: ["0", "numi"],
            count: ["64", "numi"],
        },
        run(exec, args) {
            let from = args.from;
            let [num, addr, count] = [args.num, args.addr, args.count];
            if (! is_operable_memory(exec, from))
                return 1;
            let mem = from.memory;
            if (addr < 0 || addr >= mem.length)
                return 2;
            let stop = min(addr + count, mem.length);
            for (let i = addr; i < stop; ++i)
                mem[i] = num;
        },
    },
    len: {
        args: {
            from: ["cell1", "building"],
        },
        run(exec, args) {
            let from = args.from;
            if (! is_operable_memory(exec, from))
                return -1;
            return from.memory.length;
        },
    },
};

const MemCtrlI = {
    _(builder, mode, result, args) {
        this.mode = mode;
        this.args = {};

        this.residx = builder.var(result);

        const params = (options[mode] || {}).args;
        if (!params) return;

        this.indices = {}; // Map<VarName,VarID>
        const argnames = Object.keys(params);
        for (var i in argnames) {
            this.indices[argnames[i]] = builder.var(args[i]);
        }
    },

    run(exec) {
        const mode = options[this.mode];
        if (!mode) return;

        this.exec = exec;

        for (var arg in mode.args || {}) {
            this.args[arg] = exec[mode.args[arg][1]](this.indices[arg]);
        }

        let res_code = mode.run(exec, this.args); // running

        if (res_code === undefined)
            res_code = OK_CODE;

        this.setResult(res_code);
    },

    setResult(obj) {
        this.exec["set" + ((typeof(obj) == "number") ? "num" : "obj")](this.residx, obj);
    }
};

const MemCtrlStatement = {
    new(words) {
        const st = extend(LStatement, Object.create(MemCtrlStatement));
        st.read(words);
        return st;
    },

    read(words) {
        this.mode = words[1] || "copy";
        this.result = words[2] || "result";

        let start = 3;
        this.args = new Array(ARGS_COUNT);
        for (let i = 0; i < ARGS_COUNT; ++i)
            this.args[i] = words[start + i];
    },

    write(b) {
        b.append(NAME + " ");
        b.append(this.mode + " ");
        b.append(this.result + " ");
        b.append(this.args.join(" ") + ""); // push args
    },

    build(h) {
        if (h instanceof Table) {
            return this.buildt(h);
        }

        const inst = extend(LExecutor.LInstruction, Object.create(MemCtrlI));
        inst._(h, this.mode, this.result, this.args);
        return inst;
    },

    buildt(table) {
        const add = (name) => {
            this.field(table, this[name], str => {this[name] = str}).
                width(OPTS_WIDTH).left();
            this.row(table);
        };
        const sep = (str) => {
            table.add(str).marginLeft(str.length).left();
            this.row(table);
        };

        add("result");
        sep(" = ");

        var optb = table.button(this.mode, Styles.logict, () => {
            this.showSelectTable(optb, (t, hide) => {
                for (var mode in options) {
                    this.setter(table, t, mode, hide);
                }
            });
        }).width(50).color(table.color).get();

        if (!options[this.mode]) return;

        /* Op-specific args */
        const arg_kvs = options[this.mode].args || {};
        const argnames = Object.keys(arg_kvs);
        for (var i in argnames) {
            const idx = i;
            if (this.args[i] === undefined) {
                this.args[i] = arg_kvs[argnames[i]][0];
            }

            sep(argnames[i]);
            this.field(table, this.args[i], arg => {this.args[idx] = arg}).
                width(OPTS_WIDTH).left();
            this.row(table);
        }
    },

    setter(root, table, mode, hide) {
        table.button(mode, () => {
            this.mode = mode;
            this.args.fill(undefined); // clear args
            root.clearChildren();
            hide.run();
            this.buildt(root);
        }).row();
    },

    name: () => "MemCtrl",
    color: () => Pal.logicIo,
    category: () => LCategory.io,
};

global.anuke.register(NAME, MemCtrlStatement, [
    NAME, Object.keys(options)[0], "", /* init default codes */
]);

module.exports = MemCtrlStatement;
