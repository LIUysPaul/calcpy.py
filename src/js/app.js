(() => {
    const $ = (id) => document.getElementById(id);
    const materialList = $('materialList');
    const newMatName = $('newMatName');
    const newMatPhysics = $('newMatPhysics');
    const customColor = $('customColor');
    const colorPresets = $('colorPresets');
    const levelList = $('levelList');
    const canvasWidthInput = $('canvasWidth');
    const canvasHeightInput = $('canvasHeight');
    let selectedPresetColor = '#f1c40f';

    function refreshMaterialList() {
        materialList.innerHTML = '';
        const selected = Materials.getSelected();
        for (const mat of Materials.getAll()) {
            const item = document.createElement('div');
            item.className = 'material-item' + (mat.id === selected?.id ? ' selected' : '');
            item.innerHTML =
                '<div class="material-swatch" style="background:' + mat.color + '"></div>' +
                '<span class="material-name">' + mat.name + '</span>' +
                '<span class="material-physics">' + mat.physics + '</span>';
            item.addEventListener('click', () => {
                Materials.select(mat.id);
                refreshMaterialList();
            });
            materialList.appendChild(item);
        }
    }

    function renderLevelList() {
        levelList.innerHTML = '';
        const all = Levels.getAll();
        for (const l of all) {
            const item = document.createElement('div');
            item.className = 'level-item' + (l.id === Levels.getCurrentId() ? ' active' : '');
            item.innerHTML =
                '<div class="level-thumb"><canvas width="80" height="80"></canvas></div>' +
                '<div class="level-label">' +
                    '<input type="text" value="' + l.name + '" data-id="' + l.id + '">' +
                    '<button class="del-btn" data-id="' + l.id + '" title="Delete">&times;</button>' +
                '</div>';

            item.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.classList.contains('del-btn')) return;
                switchLevel(l.id);
            });

            const nameInput = item.querySelector('input');
            nameInput.addEventListener('change', (e) => {
                Levels.renameLevel(l.id, e.target.value);
            });
            nameInput.addEventListener('click', (e) => e.stopPropagation());

            const delBtn = item.querySelector('.del-btn');
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (Levels.getAll().length <= 1) {
                    alert('At least one level is required.');
                    return;
                }
                if (confirm('Delete level "' + l.name + '"?')) {
                    Levels.deleteLevel(l.id);
                    renderLevelList();
                    drawAllThumbnails();
                }
            });

            levelList.appendChild(item);
        }
    }

    function drawAllThumbnails() {
        const items = levelList.querySelectorAll('.level-item');
        const savedId = Levels.getCurrentId();
        items.forEach((item, i) => {
            const lvls = Levels.getAll();
            if (i >= lvls.length) return;
            const l = lvls[i];
            const cur = Levels.getCurrent();
            const tempData = cur ? Grid.serialize() : null;
            const tempW = cur ? cur.width : 640;
            const tempH = cur ? cur.height : 640;

            Grid.resize(l.width, l.height, false);
            Grid.deserialize(l.grid);
            const thumbCanvas = item.querySelector('canvas');
            Grid.drawThumbnail(thumbCanvas, 80);

            Grid.resize(tempW, tempH, false);
            if (tempData) Grid.deserialize(tempData);
            Grid.render();
        });
    }

    function switchLevel(id) {
        if (Levels.getCurrentId() === id) return;
        Levels.loadLevel(id);
        renderLevelList();
        drawAllThumbnails();
    }

    colorPresets.addEventListener('click', (e) => {
        const preset = e.target.closest('.color-preset');
        if (!preset) return;
        const color = preset.dataset.color;
        selectedPresetColor = color;
        customColor.value = color;
        colorPresets.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
        preset.classList.add('selected');
    });

    customColor.addEventListener('input', () => {
        const val = customColor.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            selectedPresetColor = val;
            colorPresets.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
        }
    });

    $('btnAddMat').addEventListener('click', () => {
        const name = newMatName.value.trim();
        if (!name) return;
        Materials.add(name, selectedPresetColor, newMatPhysics.value);
        newMatName.value = '';
        refreshMaterialList();
    });

    $('btnAddLevel').addEventListener('click', () => {
        Levels.addLevel();
        renderLevelList();
        drawAllThumbnails();
    });

    $('btnDupLevel').addEventListener('click', () => {
        Levels.duplicateLevel();
        renderLevelList();
        drawAllThumbnails();
    });

    $('btnNew').addEventListener('click', () => {
        if (confirm('Create a new project? All unsaved changes will be lost.')) {
            location.reload();
        }
    });

    $('btnSave').addEventListener('click', () => {
        Levels.saveCurrent();
        const json = Storage.exportProject(
            Levels.exportAll(),
            Levels.getCurrentId(),
            Materials.getAll(),
            Materials.getSelected()?.id || null,
            Grid.getPixelSize()
        );
        $('saveOutput').value = json;
        openModal('saveModal');
    });

    $('btnCopySave').addEventListener('click', () => {
        const ta = $('saveOutput');
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        try {
            document.execCommand('copy');
            alert('Copied! Paste into a note or text file to save your project.');
        } catch (e) {
            alert('Please select all text and copy manually.');
        }
    });

    $('btnLoad').addEventListener('click', () => {
        $('loadInput').value = '';
        openModal('loadModal');
    });

    $('btnLoadConfirm').addEventListener('click', () => {
        const text = $('loadInput').value.trim();
        if (!text) return;
        try {
            const data = Storage.importProject(text);
            Materials.load(data.materials, data.selectedMaterial);
            Levels.loadProject(data);
            refreshMaterialList();
            renderLevelList();
            drawAllThumbnails();
            closeModal('loadModal');
        } catch (err) {
            alert('Failed to load project: ' + err.message);
        }
    });

    function applyCanvasSize() {
        const w = parseInt(canvasWidthInput.value) || 640;
        const h = parseInt(canvasHeightInput.value) || 640;
        Levels.resizeCurrent(w, h);
        drawAllThumbnails();
    }
    canvasWidthInput.addEventListener('change', applyCanvasSize);
    canvasHeightInput.addEventListener('change', applyCanvasSize);

    Grid.setOnChange(() => {
        Levels.saveCurrent();
        const curIdx = Levels.getAll().findIndex(l => l.id === Levels.getCurrentId());
        if (curIdx >= 0) {
            const items = levelList.querySelectorAll('.level-item');
            if (items[curIdx]) {
                const thumbCanvas = items[curIdx].querySelector('canvas');
                Grid.drawThumbnail(thumbCanvas, 80);
            }
        }
    });

    const defW = parseInt(canvasWidthInput.value) || 640;
    const defH = parseInt(canvasHeightInput.value) || 640;
    Grid.resize(defW, defH, false);
    refreshMaterialList();
    renderLevelList();
    drawAllThumbnails();
    Grid.render();
})();

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
