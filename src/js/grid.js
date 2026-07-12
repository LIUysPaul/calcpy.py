const Grid = (() => {
    const PIXEL_SIZE = 32;
    let cols = 20;
    let rows = 20;
    let cells = [];
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let onChange = null;

    function initCells() { cells = new Array(cols * rows).fill(null); }
    initCells();

    const idx = (x, y) => y * cols + x;

    const setCell = (x, y, m) => {
        if (x >= 0 && x < cols && y >= 0 && y < rows) cells[idx(x, y)] = m;
    };

    const getCell = (x, y) =>
        (x >= 0 && x < cols && y >= 0 && y < rows) ? cells[idx(x, y)] : null;

    const clear = () => cells.fill(null);
    const setOnChange = (fn) => { onChange = fn; };
    const getPixelSize = () => PIXEL_SIZE;

    function serialize() {
        const out = [];
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) row.push(cells[idx(x, y)]);
            out.push(row);
        }
        return out;
    }

    function deserialize(data) {
        clear();
        if (!data || !Array.isArray(data)) return;
        for (let y = 0; y < Math.min(rows, data.length); y++) {
            const row = data[y];
            if (!Array.isArray(row)) continue;
            for (let x = 0; x < Math.min(cols, row.length); x++) {
                cells[idx(x, y)] = row[x];
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        for (let i = 0; i <= cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * PIXEL_SIZE, 0);
            ctx.lineTo(i * PIXEL_SIZE, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * PIXEL_SIZE);
            ctx.lineTo(canvas.width, i * PIXEL_SIZE);
            ctx.stroke();
        }
        const fontSize = Math.max(8, PIXEL_SIZE * 0.3);
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const matId = cells[idx(x, y)];
                if (!matId) continue;
                const mat = Materials.getById(matId);
                if (!mat) continue;
                ctx.fillStyle = mat.color + '80';
                ctx.fillRect(
                    x * PIXEL_SIZE + 1,
                    y * PIXEL_SIZE + 1,
                    PIXEL_SIZE - 2,
                    PIXEL_SIZE - 2
                );
                ctx.fillStyle = '#fff';
                ctx.fillText(mat.name, (x + 0.5) * PIXEL_SIZE, (y + 0.5) * PIXEL_SIZE);
            }
        }
    }

    function drawThumbnail(thumbCanvas, size) {
        const tctx = thumbCanvas.getContext('2d');
        const cellW = size / cols;
        const cellH = size / rows;
        tctx.fillStyle = '#0a0a0a';
        tctx.fillRect(0, 0, size, size);
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const matId = cells[idx(x, y)];
                if (!matId) continue;
                const mat = Materials.getById(matId);
                if (!mat) continue;
                tctx.fillStyle = mat.color + 'a0';
                tctx.fillRect(x * cellW, y * cellH, cellW, cellH);
            }
        }
    }

    function resize(canvasWidth, canvasHeight, keepData) {
        const oldData = keepData ? serialize() : null;
        const oldCols = cols;
        const oldRows = rows;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        cols = Math.floor(canvasWidth / PIXEL_SIZE);
        rows = Math.floor(canvasHeight / PIXEL_SIZE);
        initCells();
        if (oldData) {
            for (let y = 0; y < Math.min(rows, oldRows); y++) {
                for (let x = 0; x < Math.min(cols, oldCols); x++) {
                    cells[idx(x, y)] = oldData[y][x];
                }
            }
        }
        render();
    }

    function getGridPos(evt) {
        const rect = canvas.getBoundingClientRect();
        const cx = evt.clientX ||
            (evt.touches && evt.touches[0] && evt.touches[0].clientX);
        const cy = evt.clientY ||
            (evt.touches && evt.touches[0] && evt.touches[0].clientY);
        if (cx == null || cy == null) return { x: -1, y: -1 };
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: Math.floor(((cx - rect.left) * scaleX) / PIXEL_SIZE),
            y: Math.floor(((cy - rect.top) * scaleY) / PIXEL_SIZE)
        };
    }

    function paintAt(pos) {
        if (pos.x < 0 || pos.x >= cols || pos.y < 0 || pos.y >= rows) return false;
        const existing = getCell(pos.x, pos.y);
        if (existing) {
            setCell(pos.x, pos.y, null);
        } else {
            const mat = Materials.getSelected();
            if (mat) setCell(pos.x, pos.y, mat.id);
        }
        return true;
    }

    function paintOnlyNew(pos) {
        if (pos.x < 0 || pos.x >= cols || pos.y < 0 || pos.y >= rows) return false;
        const existing = getCell(pos.x, pos.y);
        if (existing) return false;
        const mat = Materials.getSelected();
        if (mat) {
            setCell(pos.x, pos.y, mat.id);
            return true;
        }
        return false;
    }

    function handleStart(evt) {
        evt.preventDefault();
        isDrawing = true;
        const pos = getGridPos(evt);
        if (paintAt(pos)) {
            render();
            if (onChange) onChange();
        }
    }

    function handleMove(evt) {
        if (!isDrawing) return;
        evt.preventDefault();
        const pos = getGridPos(evt);
        if (paintOnlyNew(pos)) {
            render();
            if (onChange) onChange();
        }
    }

    function handleEnd() { isDrawing = false; }

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('touchcancel', handleEnd);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    return {
        setCell,
        getCell,
        clear,
        serialize,
        deserialize,
        render,
        resize,
        drawThumbnail,
        setOnChange,
        getPixelSize,
        getInfo: () => ({ cols, rows, pixelSize: PIXEL_SIZE })
    };
})();
