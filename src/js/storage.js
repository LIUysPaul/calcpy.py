const Storage = (() => {
    const VERSION = 3;

    function exportProject(levels, currentLevelId, materials, selectedMaterial, pixelSize) {
        return JSON.stringify({
            version: VERSION,
            name: 'ABCD Project',
            created: new Date().toISOString(),
            pixelSize,
            selectedMaterial,
            currentLevelId,
            materials,
            levels
        }, null, 2);
    }

    function importProject(jsonString) {
        const data = JSON.parse(jsonString);
        if (!data) throw new Error('Invalid file');
        return {
            pixelSize: data.pixelSize || 32,
            selectedMaterial: data.selectedMaterial || null,
            currentLevelId: data.currentLevelId || null,
            materials: data.materials || [],
            levels: data.levels || [{
                id: 'level_1',
                name: 'Level 1',
                width: 640,
                height: 640,
                grid: []
            }]
        };
    }

    return { exportProject, importProject };
})();
