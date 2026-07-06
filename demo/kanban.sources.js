let COLS = ["backlog", "progress", "review", "done"];
let initial_cards = [{
  id: 1,
  title: "Procedural dungeon gen",
  col: "backlog",
  type: "code",
  priority: "high",
  pts: 8
}, {
  id: 2,
  title: "Boss battle cutscene",
  col: "backlog",
  type: "art",
  priority: "medium",
  pts: 5
}, {
  id: 3,
  title: "Leaderboard system",
  col: "backlog",
  type: "code",
  priority: "medium",
  pts: 4
}, {
  id: 4,
  title: "Ambient sound pack",
  col: "backlog",
  type: "audio",
  priority: "low",
  pts: 3
}, {
  id: 5,
  title: "Tutorial level design",
  col: "backlog",
  type: "design",
  priority: "high",
  pts: 6
}, {
  id: 6,
  title: "Player movement physics",
  col: "progress",
  type: "code",
  priority: "critical",
  pts: 8
}, {
  id: 7,
  title: "Main menu UI",
  col: "progress",
  type: "art",
  priority: "high",
  pts: 5
}, {
  id: 8,
  title: "Synthwave OST",
  col: "progress",
  type: "audio",
  priority: "high",
  pts: 7
}, {
  id: 9,
  title: "Level 2 tilemap",
  col: "progress",
  type: "design",
  priority: "medium",
  pts: 5
}, {
  id: 10,
  title: "Inventory system",
  col: "review",
  type: "code",
  priority: "high",
  pts: 6
}, {
  id: 11,
  title: "Character sprite sheet",
  col: "review",
  type: "art",
  priority: "medium",
  pts: 4
}, {
  id: 12,
  title: "Save / load system",
  col: "review",
  type: "code",
  priority: "critical",
  pts: 7
}, {
  id: 13,
  title: "Core game loop",
  col: "done",
  type: "code",
  priority: "critical",
  pts: 8
}, {
  id: 14,
  title: "Title screen",
  col: "done",
  type: "art",
  priority: "high",
  pts: 5
}, {
  id: 15,
  title: "SFX library",
  col: "done",
  type: "audio",
  priority: "medium",
  pts: 3
}, {
  id: 16,
  title: "World map layout",
  col: "done",
  type: "design",
  priority: "high",
  pts: 6
}];
const Board = (() => {
  let _state = { cards: initial_cards, filter: "All" };
  const _subs = [];
  return {
    get cards() { return _state.cards; },
    get filter() { return _state.filter; },
    set(patch) {
      _state = Object.assign({}, _state, patch);
      for (const __fn of _subs) __fn(_state);
    },
    subscribe(fn) { _subs.push(fn); fn(_state); },
  };
})();
const col_index = (col) => ((_m) => (_m === "backlog") ? 0 : (_m === "progress") ? 1 : (_m === "review") ? 2 : 3)(col);
const col_label = (col) => ((_m) => (_m === "backlog") ? "Backlog" : (_m === "progress") ? "In Progress" : (_m === "review") ? "Review" : "✓ Done")(col);
const type_icon = (t) => ((_m) => (_m === "code") ? "⚡" : (_m === "art") ? "🎨" : (_m === "design") ? "📐" : (_m === "audio") ? "🎵" : "📋")(t);
const priority_cls = (p) => ((_m) => (_m === "critical") ? "crit" : (_m === "high") ? "high" : (_m === "medium") ? "med" : "low")(p);
const priority_label = (p) => ((_m) => (_m === "critical") ? "Critical" : (_m === "high") ? "High" : (_m === "medium") ? "Medium" : "Low")(p);
const card_moved = (c, new_col) => ({ ...c, col: new_col });
const updated_col = (c, id, dir) => {
  if (c.id == id) {
    let ni = $clamp(col_index(c.col) + dir, 0, 3);
    return card_moved(c, COLS[ni]);
  } else {
    return c;
  }
};
const move_card = (id, dir) => Board.set({ cards: $map(Board.cards, c => updated_col(c, id, dir)) });
const set_filter = (f) => Board.set({ filter: f });
const type_matches = (c) => Board.filter == "All" || c.type == Board.filter;
const col_cards = (col) => $filter(Board.cards, c => c.col == col && type_matches(c));
const render_card = (c) => {
  let icon = type_icon(c.type);
  let pcls = priority_cls(c.priority);
  let plbl = priority_label(c.priority);
  let ci = col_index(c.col);
  let btn_l = ci > 0 ? "<button class=\"mv-btn\" onclick=\"move_card(" + c.id + ",-1)\">‹</button>" : "<span class=\"mv-ph\"></span>";
  let btn_r = ci < 3 ? "<button class=\"mv-btn\" onclick=\"move_card(" + c.id + ",1)\">›</button>" : "<span class=\"mv-ph\"></span>";
  return "<div class=\"kcard type-" + c.type + "\">" + "<div class=\"kcard-head\">" + "<span class=\"kcard-icon\">" + icon + "</span>" + "<span class=\"kcard-badge " + pcls + "\">" + plbl + "</span>" + "</div>" + "<div class=\"kcard-title\">" + c.title + "</div>" + "<div class=\"kcard-foot\">" + "<span class=\"kcard-pts\">" + c.pts + " pts</span>" + "<div class=\"kcard-moves\">" + btn_l + btn_r + "</div>" + "</div>" + "</div>";
};
const render_col = (col) => {
  let cards = col_cards(col);
  let n = $count(cards);
  let pts = $sum_by(cards, c => c.pts);
  let parts = $map(cards, c => render_card(c));
  let html = parts.join("");
  document.getElementById("col-" + col).innerHTML = html == "" ? "<div class=\"empty-col\">— empty —</div>" : html;
  document.getElementById("hdr-" + col).innerHTML = col_label(col) + " <span class=\"col-count\">" + n + "</span>";
  return document.getElementById("pts-" + col).textContent = pts + " pts";
};
const render = () => {
  render_col("backlog");
  render_col("progress");
  render_col("review");
  render_col("done");
  let done_cards = $filter(Board.cards, c => c.col == "done");
  let done_n = $count(done_cards);
  let total_n = $count(Board.cards);
  let pct = total_n > 0 ? $floor(done_n * 100 / total_n) : 0;
  document.getElementById("done-pct").textContent = pct + "%";
  return document.getElementById("prog-bar-fill").style.width = pct + "%";
};
Board.subscribe(() => {
  render();
});
