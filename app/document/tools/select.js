const {on, send} = require("../../senders");
const doc = require("../doc");
const cursor = require("./cursor");
const keyboard = require("../input/keyboard");
const mouse = require("../input/mouse");
const {tools, statusbar, toolbar} = require("../ui/ui");
let enabled = false;

tools.on("start", (mode) => {
    enabled = (mode == tools.modes.SELECT);
    if (enabled) {
        statusbar.show_cursor_position();
        send("enable_editing_shortcuts");
        cursor.start_editing_mode();
        cursor.show();
        toolbar.show_select();
    } else {
        statusbar.hide_cursor_position();
        statusbar.use_canvas_size_for_status_bar();
        send("disable_editing_shortcuts");
        cursor.hide();
    }
});

function select_all() {
    if (tools.mode != tools.modes.SELECT) tools.start(tools.modes.SELECT);
    if (cursor.mode != tools.modes.SELECT) cursor.start_editing_mode();
    cursor.move_to(0, 0, false);
    cursor.start_selection_mode();
    cursor.move_to(doc.columns - 1, doc.rows - 1, false);
}

on("select_all", (event) => select_all());
keyboard.on("select_all", () => select_all());

function mouse_down(x, y, half_y, is_legal) {
    if (!enabled || !is_legal) return;
    switch (cursor.mode) {
    case cursor.modes.EDITING:
        mouse.record_start();
        cursor.move_to(x, y, false);
        break;
    case cursor.modes.SELECTION:
        cursor.start_editing_mode();
        mouse.record_start();
        cursor.move_to(x, y, false);
        break;
    case cursor.modes.OPERATION:
        cursor.move_to(x, y, false);
        cursor.place();
        break;
    }
}

function mouse_to(x, y) {
    if (!enabled) return;
    x = Math.max(Math.min(doc.columns - 1, x), 0);
    y = Math.max(Math.min(doc.rows - 1, y), 0);
    switch (cursor.mode) {
    case cursor.modes.EDITING:
        cursor.start_selection_mode();
        cursor.move_to(x, y, false);
        break;
    case cursor.modes.SELECTION:
        cursor.move_to(x, y, false);
        break;
    }
}

function mouse_move(x, y) {
    if (!enabled) return;
    x = Math.max(Math.min(doc.columns - 1, x), 0);
    y = Math.max(Math.min(doc.rows - 1, y), 0);
    if (cursor.mode == cursor.modes.OPERATION) cursor.move_to(x, y, false);
}

mouse.on("down", mouse_down);
mouse.on("to", mouse_to);
mouse.on("move", mouse_move);
