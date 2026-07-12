const Materials = (() => {
    let selectedId = null;
    const materials = new Map();
    const PHYSICS_TYPES = ['rigidbody', 'static', 'trigger', 'kinematic', 'none'];

    function add(name, color, physics) {
        const id = name.toLowerCase().replace(/\s+/g, '_');
        materials.set(id, { id, name, color, physics: physics || 'static' });
        return id;
    }

    function getById(id) { return materials.get(id) || null; }
    function getAll() { return Array.from(materials.values()); }
    function select(id) { if (materials.has(id)) selectedId = id; }
    function getSelected() { return materials.get(selectedId) || null; }
    function clear() { materials.clear(); selectedId = null; }

    function load(newMaterials, selected) {
        materials.clear();
        for (const m of newMaterials) materials.set(m.id, { ...m });
        selectedId = selected || (materials.size > 0 ? materials.keys().next().value : null);
    }

    add('stone', '#7f8c8d', 'static');
    add('lava', '#e74c3c', 'trigger');
    add('spawn', '#2ecc71', 'none');
    select('stone');

    return {
        add,
        getById,
        getAll,
        select,
        getSelected,
        clear,
        load,
        getPhysicsTypes: () => PHYSICS_TYPES
    };
})();
