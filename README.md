# Logic virtual machine reinforcement, about operating memory
- Write in JavaScript
- Game Version: v7 - v8


# Info
- repo: <https://github.com/A4-Tacks/Logic-Memory-Control>


# Mode:
## mov(from, to, dst, src, count)
> Copy `count` data from `src` in memory `from` to `dst`
## rev(from, lo, hi)
> Reverse data in interval `[l, r]` in memory `from`
## swap(from, a, b)
> Exchange data at `a` and `b` in memory `from`
## swps(from, l1, r1, l2, r2)
> Exchange elements of `[l1,h1]` and `[l2,h2]` in memory `from`
## fill(from, num, addr, count)
> Fill the `addr` in the memory `from` with `num` of the `count` quantity
## len(from)
> Get memory length
