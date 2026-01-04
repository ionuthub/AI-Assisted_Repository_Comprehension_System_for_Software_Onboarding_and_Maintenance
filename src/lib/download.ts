
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Project } from "@/types/project";

export const downloadProject = async (project: Project) => {
    const zip = new JSZip();
    const folderName = project.summary.name.replace(/\s+/g, "-").toLowerCase();

    // Recursive folder creation is handled naturally by JSZip logic with slashes
    project.files.forEach((file) => {
        if (file.content) {
            zip.file(file.path, file.content);
        }
    });

    try {
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${folderName}.zip`);
    } catch (error) {
        console.error("Failed to generate zip", error);
    }
};
