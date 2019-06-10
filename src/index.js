const fs = require('fs');
const path = require('path');

let ignoreReg = null;  // 要忽视的文件夹路径
function dirToJson(pathName) {
    let stats = fs.lstatSync(pathName);
    let structure = {};
    if (stats.isDirectory()) {
        let dir = fs.readdirSync(pathName);
        if (ignoreReg) {
            dir = dir.filter(val => !ignoreReg.test(val));
        }
        dir = dir.map(child => {
            let childPath = `${pathName}/${child}`;
            let childStats = fs.lstatSync(childPath);
            return childStats.isDirectory() ? dirToJson(childPath) : child;
        });
        let dirName = path.basename(pathName);
        structure[dirName] = dir;
    } else {
        let fileName = path.basename(pathName);
        return fileName;
    }
    return structure;
};

const characters = {
	border: '|',
	contain: '├',
	line: '─',
	last: '└'
}

function drawDirTreeWrapper(data, placeholder) {
    let outputStr = '';
    function drawDirTree(data, placeholder) {
        const {
            border,
            contain,
            line,
            last
        } = characters;
        for (let i in data) {
            if (typeof data[i] === 'string') {
                outputStr += `\n${placeholder}${data[i]}`;
            } else if (Array.isArray(data[i])) {
                outputStr += `\n${placeholder}${i}`;
                placeholder = placeholder.replace(new RegExp(contain, 'g'), border).replace(new RegExp(line, 'g'), '');
                placeholder += ` ${contain}${line}`;
                placeholder = placeholder.replace(new RegExp(`^ +`, 'g'), '');
                data[i].forEach((val, idx, arr) => {
                    let pl = placeholder;
                    if (idx === arr.length - 1) {
                        pl = placeholder.replace(new RegExp(`${contain}${line}$`, 'g'), last);
                    }
                    if (typeof val === 'string') {
                        outputStr += `\n${pl}${val}`;
                    } else {
                        drawDirTree(val, placeholder);
                    }
                })
            }
        }
    }
    drawDirTree(data, placeholder);
    return outputStr;
}

/**
 * 
 */
module.exports = options => {
    let dirPath = options.path;
    let ignore = options.ignore ? options.ignore.replace(/(^\/)|(\/$)/g, '') : '';
    
    if (/^\/.+\/$/.test(ignore)) {
        ignore = ignore.replace(/(^\/)|(\/$)/g, '');
        ignoreReg = new RegExp(ignore);
    } else {
        ignoreReg = new RegExp(`^${ignore}$`);
    }
    return drawDirTreeWrapper(dirToJson(dirPath), '');
}