// AUTO ME

// @author Daniel Wallace
// 4/15/2022

// Creates a readme.md file automatically by reading your code
let fs = require("fs")

let readmeData = ""
let tabbingRegExp = /\t+|[ ]{4,}/g // removes excess tabbing (any tab characters or spaces that exceed 4 in a row)

// todo: add an overall codebase cleanliness score at the top

let getLineNum = (code, match) => {
    let loc = code.indexOf(match)
    let subbed = code.substring(0, loc)

    let lineBreaks = subbed.match(/\n/g)
    return lineBreaks.length + 1
}

let reverseString = (str) => {
    return str.split("").reverse().join("")
}

let writeMembers = (code, webDir, wholeFile) => {
    let comments = /((\-\-)+\s*.+\s+)+/g
    let functions = /(\s*local\s*)*\s+.*function\s+.*\)/g

    let caught = code.matchAll("(" + comments.source + ")(" + functions.source + ")", "g") // combine function and comment regular expressions

    for (let block of caught) {
        let matched = block[0]
        let originalMatch = matched

        matched = reverseString(reverseString(matched).replace(/\-+/, "\n")) // replace the last comment with a line break
        matched = matched.replace(/\-+/g, "") // replace the rest with nothing

        matched = matched.replace(/\n+/g, "\n") // replace multiple line breaks with one line break
        matched = matched.replace(tabbingRegExp, "\n") // remove tabbing
        
        matched = matched.replace(functions, (str) => {
            return "\n\n###### Function:\n```lua" + str + `\n\`\`\`\n\n[Go to function](${webDir + "#L" + getLineNum(wholeFile, originalMatch)})`
        })

        readmeData += "##### Member:\n" + matched + "\n\n"
    }
}

let writeInformationBlock = (code, strictLoc, webDir) => {
    const wholeFile = code

    let members = code.substring(strictLoc + 7)
    code = code.substring(0, strictLoc - 2)
    
    code = code.replace(/\-\-/g, "\n")
    code = code.replace(/\[\[/g, "")

    code = code.replace(/\]\]/g, "")
    code = code.replace(tabbingRegExp, "") // remove tabbing
    
    readmeData += code + "\n\n"
    readmeData += "#### Members:\n\n"

    writeMembers(members, webDir, wholeFile)
    readmeData += "<hr style=\"border:2px solid gray\"></hr>\n\n"
}

let gotfile = (side, fileDir) => {
    let code = fs.readFileSync(fileDir, "utf8")
    let strictLoc = code.search(/!strict/)

    if (strictLoc < 0) {
        console.log("Unable to find strict tag in: " + fileDir)
        return
    }

    let sideStr = "# SIDE = " + `[${side}](${"https://github.com/codesenseAye/untitled-game/blob/master/src/" + side})`

    if (readmeData.indexOf(sideStr) < 0) {
        readmeData += sideStr + "\n\n"
    }

    let truncatedDir = fileDir.substring(2).replace(/\\/g, "/")
    let webDir = `https://github.com/codesenseAye/untitled-game/blob/master/${truncatedDir}`

    readmeData += "### FILE = [" + fileDir + `](${webDir}):\n\n`
    writeInformationBlock(code, strictLoc, webDir)
}

let loop = (side, dir) => {
    let files = fs.readdirSync(dir)

    for (let i = 0; i < files.length;i++) {
        let fileName = files[i]
        let result = fileName.search(/\./g)

        let newDir = dir + "\\" + fileName

        if (result > 0) {
            gotfile(side, newDir)
        } else {
            loop(side, newDir)
        }
    }
}

loop("Client", "./src/Client")
loop("Server", "./src/Server")

readmeData += "\nWritten by Autome\n- Automatically generate simple readme.md documentation for your code\n- Setup with github actions to rewrite the readme.md file at every codebase change\n\n@author codesenseAye 2022"
fs.writeFileSync("./README.md", readmeData, "utf-8")