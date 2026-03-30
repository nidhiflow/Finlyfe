// Web-only file downloads — no Capacitor dependencies

export async function saveBlobFile({ blob, fileName, mimeType }) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
}

export async function saveTextFile({ contents, fileName, mimeType = 'application/json' }) {
    const blob = new Blob([contents], { type: mimeType });
    await saveBlobFile({ blob, fileName, mimeType });
}
