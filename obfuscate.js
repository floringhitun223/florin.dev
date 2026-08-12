const fs = require("fs");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

const ROOT = path.join(__dirname, "..");

const files = fs.readdirSync(ROOT)
    .filter(file => /\.(js|css|html)$/i.test(file))
    .map(file => path.join(ROOT, file));

for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file);

    try {
        let content = fs.readFileSync(file, "utf8");

        if (ext === ".js") {
            content = JavaScriptObfuscator.obfuscate(content, {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 0.75,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.2,
                identifierNamesGenerator: "hexadecimal",
                renameGlobals: false,
                selfDefending: true,
                stringArray: true,
                stringArrayEncoding: ["base64"],
                stringArrayRotate: true,
                stringArrayShuffle: true,
                stringArrayThreshold: 0.75,
                transformObjectKeys: true
            }).getObfuscatedCode();

            fs.writeFileSync(file, content, "utf8");
            console.log(`Obfuscated JS: ${name}`);
        }

        else if (ext === ".css") {
            // Basic CSS minification
            content = content
                .replace(/\/\*[\s\S]*?\*\//g, "")
                .replace(/\s+/g, " ")
                .replace(/\s*([{}:;,>])\s*/g, "$1")
                .trim();

            fs.writeFileSync(file, content, "utf8");
            console.log(`Minified CSS: ${name}`);
        }

        else if (ext === ".html") {
            // Basic HTML minification
            content = content
                .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
                .replace(/>\s+</g, "><")
                .replace(/\s{2,}/g, " ")
                .trim();

            fs.writeFileSync(file, content, "utf8");
            console.log(`Minified HTML: ${name}`);
        }

    } catch (error) {
        console.error(`Failed: ${name}`);
        console.error(error.message);
        process.exit(1);
    }
}

console.log(`\n✓ Processed ${files.length} root file(s).`);