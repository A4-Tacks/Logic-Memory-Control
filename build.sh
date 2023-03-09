#!/usr/bin/bash

import(){
    local i result
    for i in "$@"
    do
        echo -n "import ${i@Q}"
        result="$(which "$i")"
        [ -n "$result" ] || {
            echoerr $'\n'"${i@Q} not found. exit"
            exit 8
        }
        echo " -> ${result@Q}"
    done
}

echovar(){
    echo "$1=${!1@Q}"
}

echoerr(){
    echo $'\e[91m'"$*"$'\e[0m'
}

echoline(){
    local i
    for i in "$@"
    do
        echo "$i"
    done
}

cmkdir(){
    local i
    for i in "$@"
    do
        [ -e "$i" ]||{
            echo mkdir "$i"
            mkdir "$i"
        }
    done
}

OIFS="$IFS"

import jq

cd "$(dirname "$0")"

proot="$(pwd -P)"

cmkdir "$proot/"{src,package,backup,project}

cd "$proot/src"

DATE_FORMAT="%Y-%m-%d_%H-%M-%S"

version="$(jq '.version' mod.json -r)"
name="$(jq '.name' mod.json -r)"
minGameVersion="$(jq '.minGameVersion' mod.json -r)"

if [ -z "$name" ]||[ -z "$version" ]||[ -z "$minGameVersion" ]
then
    echoerr "mod_name or mod_version is empty."
fi

name="${name// /_}"
package_name="${name}_v${version}_$(date +"$DATE_FORMAT")"

echovar proot
echovar name
echovar version
echovar package_name
echovar minGameVersion

case "$1" in
    z|j|J|7)
        import tar
        stdout=1
        cd "$proot"
        case "$1" in
            z) pkg_format=gz;cmd="gzip -vv --best";;
            j) pkg_format=bz2;cmd="bzip2 -vv --best";;
            J) pkg_format=xz;cmd="xz -9 -T 0 -e -vv";;
            7) pkg_format=7z;
                threads="$(cat /proc/cpuinfo|grep "processor"|wc -l)"
                cmd="7zz a -si -ssc -bb3 -mx9 -mmt$[threads > 0 ? threads : 1]"
                stdout=0
                ;;
        esac
        import "${cmd%% *}"
        package_name+="-source"
        level=9
        target="project"
        IFS=$'\n'
        targets=($(ls -A|awk -v a="$target" '!match($0, a)'))
        IFS="$OIFS"
        output="$proot/$target/$package_name.tar.$pkg_format"
        echovar level
        echovar cmd
        echovar output
        echovar stdout
        tar -c "${targets[@]}" \
            | if ((stdout)); then $cmd > "$output"
                else $cmd "$output"; fi
        ;;
    c)
        import zip sha256sum
        filename="$proot/package/$package_name.zip"
        hash_list="$proot/hash_list.txt"
        echovar filename
        zip -9 -r "$filename" .
        hash=($(sha256sum "$filename"))
        echo "$hash  ${filename##*/}" >> "$hash_list"
        echo "hash_code: $hash"
        cat <<< "$(tail -n1000 "$hash_list")" > "$hash_list"
        ;;
    h)
        echoline \
            "    build arg1 [arg2...]" \
            "        z|j|J|7     compress project (gz,bz,xz,7z)" \
            "        c           build source code" \
            "        h           display help info"
        exit 1
        ;;
    *)
        echoerr $'args count is zero\n' "run \` bash ${0@Q} h \` output help info."
        exit 2
        ;;
esac
