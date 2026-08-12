const { execSync } = require("child_process");

function run(command) {
    console.log(`\n> ${command}`);
    execSync(command, { stdio: "inherit" });
}

try {
    // 1. Obfuscate
    run("node obfuscate.js");

    // 2. Git
    run("git add .");
    run('git commit -m "publish"');
    run("git push");

    console.log("\n✓ Published successfully!");
} catch (error) {
    console.error("\n✗ Publish failed.");
    process.exit(1);
}