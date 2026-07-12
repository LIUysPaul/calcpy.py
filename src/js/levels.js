const Levels = (() => {
    let levels = [];
    let currentId = null;
    let nextNum = 1;

    function createLevel(name, width, height) {
        const num = nextNum++;
        return {
            id: 'level_' + num,
            name: name || ('Level ' + num),
            width: width || 640,
            height: height || 640,
            grid: []
        };
    }

    function getAll() { return levels.map(l => ({ ...l })); }
    function getCurrent() { return levels.find(l => l.id === currentId) || null; }
    function getCurrentId() { return currentId; }

    function saveCurrent() {
        const cur = getCurrent();
        if (cur) cur.grid = Grid.serialize();
    }

    function loadLevel(id) {
        saveCurrent();
        const l = levels.find(l => l.id === id);
        if (!l) return false;
        currentId = id;
        document.getElementById('canvasWidth').value = l.width;
        document.getElementById('canvasHeight').value = l.height;
        Grid.resize(l.width, l.height, false);
        Grid.deserialize(l.grid);
        Grid.render();
        return true;
    }

    function addLevel() {
        saveCurrent();
        const cur = getCurrent();
        const l = createLevel(null, cur ? cur.width : 640, cur ? cur.height : 640);
        levels.push(l);
        currentId = l.id;
        Grid.resize(l.width, l.height, false);
        Grid.render();
        return l;
    }

    function duplicateLevel() {
        saveCurrent();
        const cur = getCurrent();
        if (!cur) return null;
        const l = createLevel(cur.name + ' copy', cur.width, cur.height);
        l.grid = JSON.parse(JSON.stringify(cur.grid));
        const idx = levels.findIndex(x => x.id === cur.id);
        levels.splice(idx + 1, 0, l);
        currentId = l.id;
        Grid.resize(l.width, l.height, false);
        Grid.deserialize(l.grid);
        Grid.render();
        return l;
    }

    function deleteLevel(id) {
        if (levels.length <= 1) return false;
        const idx = levels.findIndex(l => l.id === id);
        if (idx === -1) return false;
        levels.splice(idx, 1);
        if (currentId === id) {
            const newIdx = Math.min(idx, levels.length - 1);
            currentId = levels[newIdx].id;
            loadLevel(currentId);
        }
        return true;
    }

    function renameLevel(id, name) {
        const l = levels.find(l => l.id === id);
        if (l) l.name = name;
    }

    function resizeCurrent(w, h) {
        const cur = getCurrent();
        if (!cur) return;
        cur.width = w;
        cur.height = h;
        Grid.resize(w, h, true);
    }

    function loadProject(projectData) {
        levels = [];
        nextNum = 1;
        let maxNum = 0;
        for (const l of projectData.levels) {
            const match = l.id.match(/level_(\d+)/);
            const num = match ? parseInt(match[1]) : 0;
            if (num > maxNum) maxNum = num;
            levels.push({
                id: l.id,
                name: l.name || 'Level',
                width: l.width || 640,
                height: l.height || 640,
                grid: l.grid || []
            });
        }
        nextNum = maxNum + 1;
        if (levels.length === 0) {
            const l = createLevel('Level 1', 640, 640);
            levels.push(l);
            currentId = l.id;
            return;
        }
        currentId = projectData.currentLevelId || levels[0].id;
        if (!levels.find(l => l.id === currentId)) currentId = levels[0].id;
        const cur = getCurrent();
        document.getElementById('canvasWidth').value = cur.width;
        document.getElementById('canvasHeight').value = cur.height;
        Grid.resize(cur.width, cur.height, false);
        Grid.deserialize(cur.grid);
        Grid.render();
    }

    function exportAll() {
        saveCurrent();
        return levels.map(l => ({
            id: l.id,
            name: l.name,
            width: l.width,
            height: l.height,
            grid: l.grid
        }));
    }

    const first = createLevel('Level 1', 640, 640);
    levels.push(first);
    currentId = first.id;

    return {
        getAll,
        getCurrent,
        getCurrentId,
        saveCurrent,
        loadLevel,
        addLevel,
        duplicateLevel,
        deleteLevel,
        renameLevel,
        resizeCurrent,
        loadProject,
        exportAll
    };
})();
