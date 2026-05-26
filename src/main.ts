import {
    Plugin,
    TFile
} from "obsidian";

export default class PeriodicCommandPlugin extends Plugin {
    async onload() {
        // 1. Weekly Note Command
        this.addCommand({
            id: "create-weekly-note",
            name: "주간 노트 열기",
            callback: () => {
                void this.getOrCreatePeriodicNote("weekly");
            }
        });

        // 2. Monthly Note Command
        this.addCommand({
            id: "create-monthly-note",
            name: "월간 노트 열기",
            callback: () => {
                void this.getOrCreatePeriodicNote("monthly");
            }
        });

        // 3. Yearly Note Command
        this.addCommand({
            id: "create-yearly-note",
            name: "연간 노트 열기",
            callback: () => {
                void this.getOrCreatePeriodicNote("yearly");
            }
        });
    }

    async ensureDirectoryExists(filePath: string) {
        const parts = filePath.split("/").filter((p) => p);
        if (parts.length <= 1) return;
        
        // Remove filename
        parts.pop();
        
        let currentPath = "";
        for (const part of parts) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const exists = this.app.vault.getAbstractFileByPath(currentPath);
            if (!exists) {
                try {
                    await this.app.vault.createFolder(currentPath);
                } catch {
                    // Ignore folder exists error
                }
            }
        }
    }

    async getOrCreatePeriodicNote(noteType: "weekly" | "monthly" | "yearly") {
        const now = window.moment();
        const year = now.format("YYYY");
        
        let fullPath: string;
        if (noteType === "weekly") {
            const week = now.format("WW");
            fullPath = `40 - Periodic/${year}/00 - Weekly/W${week}.md`;
        } else if (noteType === "monthly") {
            const month = now.format("MM");
            fullPath = `40 - Periodic/${year}/${month}/${month}.md`;
        } else {
            fullPath = `40 - Periodic/${year}/${year}.md`;
        }

        // Check if file already exists
        let file = this.app.vault.getAbstractFileByPath(fullPath);
        
        if (!file) {
            // Ensure folder structure exists
            await this.ensureDirectoryExists(fullPath);
            
            try {
                // Do not insert any content (create with empty content as requested)
                file = await this.app.vault.create(fullPath, "");
            } catch {
                console.error(`Failed to create file at ${fullPath}`);
            }
        }

        if (file instanceof TFile) {
            const leaf = this.app.workspace.getLeaf(false);
            await leaf.openFile(file);
        }
    }
}
