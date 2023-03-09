// loader script
const anuke = global.anuke = {
    /* Mimic @RegisterStatement */
    register(name, statement, def) {
        LAssembler.customParsers.put(name, func(statement.new));
        LogicIO.allStatements.add(prov(() => statement.new(def)));
    }
};
const list_key_value = (data) => {
    if (data === null)
        return data;
    let key;
    let result = new Array();
    let keys = Object.keys(data);
    for (let i in keys) {
        key = keys[i];
        result.push("+ " + key);
    }
    return result.join("\n");
};
const add = (type, names) => {
    var path, name, temp;
    for (let i in names) {
        name = names[i];
        path = type + "/" + name;
        Log.info("Load " + path);
        try {
            temp = require(path);
            Log.info("---\n" + list_key_value(temp));
            anuke[name] = temp;
            Log.info("Load " + path + " done.");
        } catch (e) {
            Log.err("Load " + path + " error. [" + e.message + "]\n"
                + list_key_value(e),
                type, name, e, e.fileName,
                new java.lang.Integer(e.lineNumber));
            anuke[name] = null;
        }
    }
};
/* Instructions */
add("inst", ["memory_control"]);
/* Blocks */
add("blocks", []);
/* Units */
add("units", []);
/* Misc */
add("misc", []);