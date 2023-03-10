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


# Examples
> ```
> sensor enabled switch1 @enabled
> wait 0.1
> jump 0 equal enabled true
> read len cell1 0
> set i 1
> jump 22 always 0 0
> set l 0
> set r i
> read num bank1 i
> jump 18 always 0 0
> op sub m r l
> op idiv m m 2
> op add m m l
> read v bank1 m
> jump 17 greaterThan v num
> op add l m 1
> jump 18 always 0 0
> set r m
> jump 10 lessThan l r
> op sub c i 1
> memctrl swps result bank1 l c i i
> op add i i 1
> jump 6 lessThan i len
> control enabled switch1 true 0 0 0
> ```
- Because of the use of this statement, in Mindustry, the time complexity of the binary insertion sorting algorithm reaches O(n log n)
