import React, { useState, useMemo } from "react";

// ============================================================
//  MacroFit — Nutrición inteligente. Resultados reales.
//  v2: coherencia culinaria + lista de compras + equivalencias
//  Base científica:
//   - Metabolismo basal: Mifflin-St Jeor
//   - Déficit 20% (15-25%) · Superávit 10% (5-15%)
//   - Proteína 1.8 g/kg (déficit 2.0), grasas 0.9 g/kg, resto carbos
//   - Agua ~35 ml/kg · Sueño 7-9 h · Creatina 5g · Omega-3 2g EPA+DHA
// ============================================================

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", line: "#E2E8F0",
  green: "#18B66A", greenSoft: "#E7F8EF",
  blue: "#174C7D", blueSoft: "#E8F0F7",
  success: "#22C55E", warn: "#F59E0B", error: "#EF4444",
  text: "#1F2937", dim: "#64748B", faint: "#94A3B8",
  protein: "#EF4444", carb: "#F59E0B", fat: "#174C7D",
};

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const ACTIVITY = [
  { key: "sed", label: "Sedentario", desc: "Poco o nada de ejercicio", f: 1.2 },
  { key: "lig", label: "Ligero", desc: "1–3 días/semana", f: 1.375 },
  { key: "mod", label: "Moderado", desc: "3–5 días/semana", f: 1.55 },
  { key: "act", label: "Activo", desc: "6–7 días/semana", f: 1.725 },
  { key: "muy", label: "Muy activo", desc: "Trabajo físico + entreno", f: 1.9 },
];

const GOALS = [
  { key: "def", label: "Déficit", desc: "Perder grasa (−20%)", f: 0.8, color: C.warn },
  { key: "man", label: "Mantenimiento", desc: "Mantener peso", f: 1.0, color: C.blue },
  { key: "sup", label: "Superávit", desc: "Ganar músculo (+10%)", f: 1.1, color: C.green },
];

// slots = comidas donde encaja · style = dulce | salado | neutro
const FOODS = {
  protein: [
    { id: "wheyprot", name: "Proteína en polvo", emoji: "🥤", p: 80, c: 8, f: 6, portion: "1 scoop (~30g)", unit: 30, supp: true, slots: ["des", "tar"], style: "dulce" },
    { id: "pollo", name: "Pechuga de pollo", emoji: "🍗", p: 23, c: 0, f: 2, portion: "palma de la mano", slots: ["alm", "cen"], style: "salado" },
    { id: "huevo", name: "Huevo entero", emoji: "🥚", p: 13, c: 1, f: 11, portion: "2 unidades", unit: 50, slots: ["des", "cen"], style: "salado" },
    { id: "res", name: "Carne de res magra", emoji: "🥩", p: 21, c: 0, f: 8, portion: "palma de la mano", slots: ["alm", "cen"], style: "salado" },
    { id: "atun", name: "Atún", emoji: "🐟", p: 26, c: 0, f: 1, portion: "1 lata", slots: ["alm", "cen"], style: "salado" },
    { id: "salmon", name: "Salmón", emoji: "🐠", p: 20, c: 0, f: 13, portion: "palma de la mano", slots: ["alm", "cen"], style: "salado" },
    { id: "cerdo", name: "Lomo de cerdo", emoji: "🍖", p: 22, c: 0, f: 6, portion: "palma de la mano", slots: ["alm", "cen"], style: "salado" },
    { id: "yogur", name: "Yogur griego", emoji: "🥛", p: 10, c: 4, f: 0.4, portion: "1 vaso", slots: ["des", "tar"], style: "dulce" },
    { id: "queso", name: "Queso fresco", emoji: "🧀", p: 18, c: 3, f: 9, portion: "1 rebanada gruesa", slots: ["des", "tar", "cen"], style: "neutro" },
    { id: "lenteja", name: "Lentejas", emoji: "🫘", p: 9, c: 20, f: 0.4, portion: "1 puño cocido", slots: ["alm", "cen"], style: "salado" },
    { id: "tofu", name: "Tofu", emoji: "⬜", p: 8, c: 2, f: 5, portion: "1 bloque pequeño", slots: ["alm", "cen"], style: "salado" },
  ],
  carb: [
    { id: "arroz", name: "Arroz", emoji: "🍚", p: 2.7, c: 28, f: 0.3, portion: "1 puño cocido", slots: ["alm", "cen"], style: "salado" },
    { id: "papa", name: "Papa", emoji: "🥔", p: 2, c: 17, f: 0.1, portion: "1 mediana", slots: ["alm", "cen"], style: "salado" },
    { id: "avena", name: "Avena", emoji: "🥣", p: 13, c: 66, f: 7, portion: "1/2 taza seca", slots: ["des", "tar"], style: "dulce" },
    { id: "pan", name: "Pan integral", emoji: "🍞", p: 9, c: 43, f: 3, portion: "2 rebanadas", unit: 30, slots: ["des", "tar", "cen"], style: "neutro" },
    { id: "pasta", name: "Pasta", emoji: "🍝", p: 5, c: 30, f: 1, portion: "1 puño cocido", slots: ["alm", "cen"], style: "salado" },
    { id: "arepa", name: "Arepa de maíz", emoji: "🫓", p: 4, c: 40, f: 2, portion: "1 unidad", unit: 70, slots: ["des", "cen"], style: "neutro" },
    { id: "yuca", name: "Yuca", emoji: "🍠", p: 1.4, c: 38, f: 0.3, portion: "1 trozo", slots: ["alm", "cen"], style: "salado" },
    { id: "platano", name: "Plátano cocido", emoji: "🍌", p: 1.3, c: 32, f: 0.4, portion: "1/2 unidad", slots: ["alm", "cen"], style: "salado" },
    { id: "quinoa", name: "Quinoa", emoji: "🌾", p: 4.4, c: 21, f: 1.9, portion: "1 puño cocido", slots: ["alm", "cen"], style: "salado" },
  ],
  fat: [
    { id: "aguacate", name: "Aguacate", emoji: "🥑", p: 2, c: 9, f: 15, portion: "1/2 unidad", slots: ["des", "alm", "cen"], style: "neutro" },
    { id: "aceite", name: "Aceite de oliva", emoji: "🫒", p: 0, c: 0, f: 100, portion: "1 cucharada", unit: 10, slots: ["alm", "cen"], style: "salado" },
    { id: "almendra", name: "Almendras", emoji: "🌰", p: 21, c: 22, f: 49, portion: "1 puño pequeño", slots: ["des", "tar"], style: "dulce" },
    { id: "mani", name: "Maní / mantequilla", emoji: "🥜", p: 25, c: 16, f: 50, portion: "1 cucharada", slots: ["des", "tar"], style: "dulce" },
    { id: "chia", name: "Semillas de chía", emoji: "⚫", p: 17, c: 42, f: 31, portion: "1 cucharada", slots: ["des", "tar"], style: "dulce" },
  ],
  veg: [
    { id: "brocoli", name: "Brócoli", emoji: "🥦", p: 2.8, c: 7, f: 0.4, portion: "1 puño", slots: ["alm", "cen"], style: "salado" },
    { id: "espinaca", name: "Espinaca", emoji: "🥬", p: 2.9, c: 3.6, f: 0.4, portion: "2 puños", slots: ["des", "alm", "cen"], style: "salado" },
    { id: "tomate", name: "Tomate", emoji: "🍅", p: 0.9, c: 3.9, f: 0.2, portion: "1 unidad", slots: ["des", "alm", "cen"], style: "salado" },
    { id: "zanahoria", name: "Zanahoria", emoji: "🥕", p: 0.9, c: 10, f: 0.2, portion: "1 unidad", slots: ["alm", "cen"], style: "salado" },
    { id: "lechuga", name: "Lechuga / mix verde", emoji: "🥗", p: 1.4, c: 2.9, f: 0.2, portion: "1 plato", slots: ["alm", "cen"], style: "salado" },
    { id: "pepino", name: "Pepino", emoji: "🥒", p: 0.7, c: 3.6, f: 0.1, portion: "1/2 unidad", slots: ["alm", "cen"], style: "salado" },
    { id: "pimenton", name: "Pimentón", emoji: "🫑", p: 1, c: 6, f: 0.3, portion: "1/2 unidad", slots: ["alm", "cen"], style: "salado" },
  ],
  fruit: [
    { id: "banano", name: "Banano", emoji: "🍌", p: 1.1, c: 23, f: 0.3, portion: "1 unidad", slots: ["des", "tar"], style: "dulce" },
    { id: "manzana", name: "Manzana", emoji: "🍎", p: 0.3, c: 14, f: 0.2, portion: "1 unidad", slots: ["des", "tar"], style: "dulce" },
    { id: "fresa", name: "Fresas", emoji: "🍓", p: 0.7, c: 8, f: 0.3, portion: "1 puño", slots: ["des", "tar"], style: "dulce" },
    { id: "arandano", name: "Arándanos", emoji: "🫐", p: 0.7, c: 14, f: 0.3, portion: "1 puño", slots: ["des", "tar"], style: "dulce" },
    { id: "naranja", name: "Naranja", emoji: "🍊", p: 0.9, c: 12, f: 0.1, portion: "1 unidad", slots: ["des", "tar"], style: "dulce" },
    { id: "papaya", name: "Papaya", emoji: "🧡", p: 0.5, c: 11, f: 0.3, portion: "1 tajada", slots: ["des", "tar"], style: "dulce" },
    { id: "pina", name: "Piña", emoji: "🍍", p: 0.5, c: 13, f: 0.1, portion: "1 rodaja", slots: ["des", "tar"], style: "dulce" },
  ],
};

const DISH_NAMES = {
  "avena+wheyprot": "Avena proteica", "avena+yogur": "Avena con yogur griego",
  "avena+huevo": "Avena y huevos revueltos", "avena+queso": "Avena con queso",
  "pan+huevo": "Tostadas con huevo", "pan+queso": "Tostadas con queso",
  "pan+wheyprot": "Tostadas + batido de proteína", "pan+yogur": "Tostadas con yogur",
  "arepa+huevo": "Arepa con huevo", "arepa+queso": "Arepa con queso",
  "arroz+pollo": "Arroz con pollo", "arroz+res": "Arroz con carne de res",
  "arroz+atun": "Arroz con atún", "arroz+salmon": "Arroz con salmón",
  "arroz+cerdo": "Arroz con lomo de cerdo", "arroz+lenteja": "Arroz con lentejas",
  "arroz+tofu": "Arroz salteado con tofu", "arroz+huevo": "Arroz con huevo",
  "papa+pollo": "Pollo con papas", "papa+res": "Carne con papas",
  "papa+salmon": "Salmón con papas", "papa+cerdo": "Cerdo con papas",
  "papa+huevo": "Papas con huevo", "papa+atun": "Papas con atún",
  "pasta+pollo": "Pasta con pollo", "pasta+res": "Pasta a la boloñesa",
  "pasta+atun": "Pasta con atún", "pasta+tofu": "Pasta con tofu",
  "pasta+queso": "Pasta con queso",
  "quinoa+pollo": "Bowl de quinoa con pollo", "quinoa+salmon": "Bowl de quinoa con salmón",
  "quinoa+tofu": "Bowl de quinoa con tofu", "quinoa+atun": "Bowl de quinoa con atún",
  "quinoa+lenteja": "Bowl de quinoa y lentejas",
  "yuca+pollo": "Pollo con yuca", "yuca+res": "Carne con yuca", "yuca+cerdo": "Cerdo con yuca",
  "platano+pollo": "Pollo con plátano", "platano+res": "Carne con plátano",
  "platano+huevo": "Plátano con huevo",
  "pan+atun": "Sándwich de atún", "pan+pollo": "Sándwich de pollo",
  "arepa+pollo": "Arepa rellena de pollo", "arepa+res": "Arepa rellena de carne",
};

const dishName = (carbId, protId, mealKey) => {
  const key = `${carbId}+${protId}`;
  if (DISH_NAMES[key]) return DISH_NAMES[key];
  const prot = FOODS.protein.find((p) => p.id === protId);
  const carb = FOODS.carb.find((c) => c.id === carbId);
  if (!prot || !carb) return null;
  if (mealKey === "des" || mealKey === "tar") return `${carb.name} con ${prot.name.toLowerCase()}`;
  return `${prot.name} con ${carb.name.toLowerCase()}`;
};

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEALS = [
  { key: "des", label: "Desayuno", emoji: "🌅", share: 0.28 },
  { key: "alm", label: "Almuerzo", emoji: "☀️", share: 0.35 },
  { key: "tar", label: "Media tarde", emoji: "🌤️", share: 0.12 },
  { key: "cen", label: "Cena", emoji: "🌙", share: 0.25 },
];

const kcalOf = (f) => f.p * 4 + f.c * 4 + f.f * 9;
const pick = (arr, seed) => (arr.length ? arr[seed % arr.length] : null);
const fitting = (list, mealKey, style) =>
  list.filter((f) => f.slots.includes(mealKey) && (!style || f.style === style || f.style === "neutro"));

function scaleFood(food, targetKcal) {
  const per100 = kcalOf(food);
  if (per100 <= 0) return null;
  let grams = (targetKcal / per100) * 100;
  grams = Math.max(15, Math.round(grams / 5) * 5);
  const factor = grams / 100;
  return {
    ...food, grams,
    kp: Math.round(food.p * factor), kc: Math.round(food.c * factor),
    kf: Math.round(food.f * factor), kcal: Math.round(per100 * factor),
    portions: food.unit ? Math.max(1, Math.round(grams / food.unit)) : null,
  };
}

const Logo = ({ size = 44, radius = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx={radius} fill="#18B66A" />
    <path d="M11 36 L11 14 L24 27 L37 14 L37 36" stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M18.5 20.5 L24 15 L29.5 20.5" stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export default function MacroFit() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ gender: "", age: "", height: "", weight: "", activity: "" });
  const [goal, setGoal] = useState("");
  const [prefs, setPrefs] = useState({ protein: [], carb: [], fat: [], veg: [], fruit: [] });
  const [pdfState, setPdfState] = useState("idle");
  const [seed, setSeed] = useState(0);
  const [tab, setTab] = useState("menu");

  const bmr = useMemo(() => {
    const { gender, age, height, weight } = form;
    if (!gender || !age || !height || !weight) return null;
    const base = 10 * +weight + 6.25 * +height - 5 * +age;
    return gender === "m" ? base + 5 : base - 161;
  }, [form]);

  const maintenance = useMemo(() => {
    if (!bmr || !form.activity) return null;
    const act = ACTIVITY.find((a) => a.key === form.activity);
    return Math.round((bmr * act.f) / 10) * 10;
  }, [bmr, form.activity]);

  const targetKcal = useMemo(() => {
    if (!maintenance || !goal) return null;
    const g = GOALS.find((x) => x.key === goal);
    return Math.round((maintenance * g.f) / 10) * 10;
  }, [maintenance, goal]);

  const macros = useMemo(() => {
    if (!targetKcal) return null;
    const w = +form.weight;
    const pg = Math.round((goal === "def" ? 2.0 : 1.8) * w);
    const fg = Math.round(0.9 * w);
    const cKcal = Math.max(0, targetKcal - pg * 4 - fg * 9);
    return { p: pg, f: fg, c: Math.round(cKcal / 4) };
  }, [targetKcal, form.weight, goal]);

  const lifestyle = useMemo(() => {
    const w = +form.weight || 0;
    const water = w ? (Math.round((w * 35) / 100) / 10).toFixed(1) : null;
    return { water, sleep: goal === "sup" ? "8–9 h" : "7–9 h", takesWhey: prefs.protein.includes("wheyprot") };
  }, [form.weight, goal, prefs.protein]);

  const canCalc = form.gender && form.age && form.height && form.weight && form.activity;

  // ---------- MOTOR DE MENÚ COHERENTE ----------
  const menu = useMemo(() => {
    if (!targetKcal || !macros || step < 4) return null;
    const sel = {
      protein: FOODS.protein.filter((f) => prefs.protein.includes(f.id)),
      carb: FOODS.carb.filter((f) => prefs.carb.includes(f.id)),
      fat: FOODS.fat.filter((f) => prefs.fat.includes(f.id)),
      veg: FOODS.veg.filter((f) => prefs.veg.includes(f.id)),
      fruit: FOODS.fruit.filter((f) => prefs.fruit.includes(f.id)),
    };
    if (!sel.protein.length || !sel.carb.length) return null;

    let s = seed * 13;
    return DAYS.map((day, di) => {
      const meals = MEALS.map((meal, mi) => {
        const mealKcal = targetKcal * meal.share;
        s += 11;

        let protPool = fitting(sel.protein, meal.key);
        if (!protPool.length) protPool = sel.protein;
        const prot = pick(protPool, s + di * 3 + mi);

        let carbPool = fitting(sel.carb, meal.key, prot.style);
        if (!carbPool.length) carbPool = fitting(sel.carb, meal.key);
        if (!carbPool.length) carbPool = sel.carb;
        const carb = pick(carbPool, s * 2 + di * 5 + mi);

        const fatPool = fitting(sel.fat, meal.key, prot.style);
        const fat = fatPool.length ? pick(fatPool, s + di + mi * 2) : null;
        const vegPool = fitting(sel.veg, meal.key);
        const veg = vegPool.length ? pick(vegPool, s + di * 2 + mi) : null;
        const fruitPool = fitting(sel.fruit, meal.key);
        const fruit = fruitPool.length ? pick(fruitPool, s * 3 + di + mi) : null;

        const isSweet = prot.style === "dulce";
        const items = [];
        const pItem = scaleFood(prot, mealKcal * 0.42);
        if (pItem) items.push(pItem);
        const cItem = scaleFood(carb, mealKcal * (meal.key === "tar" ? 0.35 : 0.40));
        if (cItem) items.push(cItem);
        if (fat) { const fi = scaleFood(fat, mealKcal * 0.14); if (fi) items.push(fi); }
        if (!isSweet && veg && (meal.key === "alm" || meal.key === "cen")) {
          const vi = scaleFood(veg, mealKcal * 0.06); if (vi) items.push(vi);
        }
        if (isSweet && fruit) { const fr = scaleFood(fruit, mealKcal * 0.12); if (fr) items.push(fr); }

        const tot = items.reduce((a, it) => ({ p: a.p + it.kp, c: a.c + it.kc, f: a.f + it.kf, kcal: a.kcal + it.kcal }), { p: 0, c: 0, f: 0, kcal: 0 });
        return { ...meal, items, tot, dish: dishName(carb.id, prot.id, meal.key) };
      });
      const dayTot = meals.reduce((a, m) => ({ p: a.p + m.tot.p, c: a.c + m.tot.c, f: a.f + m.tot.f, kcal: a.kcal + m.tot.kcal }), { p: 0, c: 0, f: 0, kcal: 0 });
      return { day, meals, dayTot };
    });
  }, [targetKcal, macros, prefs, step, seed]);

  // ---------- LISTA DE COMPRAS ----------
  const shopping = useMemo(() => {
    if (!menu) return null;
    const acc = {};
    menu.forEach((d) => d.meals.forEach((m) => m.items.forEach((it) => {
      if (!acc[it.id]) acc[it.id] = { name: it.name, emoji: it.emoji, grams: 0, unit: it.unit };
      acc[it.id].grams += it.grams;
    })));
    return Object.values(acc).map((x) => ({
      ...x,
      display: x.grams >= 1000 ? `${(x.grams / 1000).toFixed(1)} kg` : `${x.grams} g`,
      units: x.unit ? Math.ceil(x.grams / x.unit) : null,
    })).sort((a, b) => b.grams - a.grams);
  }, [menu]);

  // ---------- EQUIVALENCIAS ----------
  const equivalences = useMemo(() => {
    if (!menu) return null;
    const groups = [];
    const build = (cat, title, refs) => {
      const sel = FOODS[cat].filter((f) => prefs[cat].includes(f.id));
      if (sel.length < 2) return;
      const rows = refs.map((refK) => ({
        refK,
        cells: sel.map((f) => {
          const per100 = kcalOf(f);
          const g = Math.max(5, Math.round((refK / per100) * 100 / 5) * 5);
          return { grams: g, unit: f.unit ? Math.max(1, Math.round(g / f.unit)) : null };
        }),
      }));
      groups.push({ title, foods: sel.map((f) => f.name), rows });
    };
    build("protein", "Proteínas", [100, 150, 200, 250]);
    build("carb", "Carbohidratos", [100, 150, 200, 300]);
    build("fat", "Grasas", [50, 100, 150]);
    return groups;
  }, [menu, prefs]);

  const togglePref = (cat, id) =>
    setPrefs((p) => ({ ...p, [cat]: p[cat].includes(id) ? p[cat].filter((x) => x !== id) : [...p[cat], id] }));

  const supplements = useMemo(() => {
    const list = [
      { name: "Creatina monohidratada", dose: "5 g al día, cualquier hora", note: "El suplemento con más respaldo para fuerza y masa muscular. Constante, todos los días." },
      { name: "Omega 3 (EPA + DHA)", dose: "2000 mg (2 g) al día con comida", note: "Dosis eficaz para recuperación y control de la inflamación. Sostener al menos 6 semanas. Prioriza fórmulas con más EPA." },
    ];
    if (lifestyle.takesWhey) {
      list.push({ name: "Proteína en polvo", dose: "1 scoop (~25 g proteína)", note: "Práctica para cerrar tu objetivo de proteína. No reemplaza comida real, la complementa." });
    }
    return list;
  }, [lifestyle.takesWhey]);

  // ---------- PDF ----------
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const sc = document.createElement("script");
      sc.src = src; sc.onload = resolve; sc.onerror = reject;
      document.body.appendChild(sc);
    });

  const generatePDF = async () => {
    if (!menu) return;
    setPdfState("loading");
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const M = 40;
      let y = 0;
      let pageNum = 0;

      const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
      const setFill = (h) => doc.setFillColor(...hex(h));
      const setText = (h) => doc.setTextColor(...hex(h));
      const setDraw = (h) => doc.setDrawColor(...hex(h));

      const MEAL_COLORS = { des: "#F59E0B", alm: "#18B66A", tar: "#8B5CF6", cen: "#174C7D" };

      const footer = () => {
        pageNum++;
        setDraw("#E2E8F0"); doc.setLineWidth(0.6);
        doc.line(M, 38, W - M, 38);
        setText("#94A3B8"); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
        doc.text("MacroFit · Nutricion inteligente. Resultados reales.", M, 26);
        doc.text(String(pageNum), W - M, 26, { align: "right" });
      };
      const newPage = () => { doc.addPage(); setFill("#F8FAFC"); doc.rect(0, 0, W, H, "F"); y = H - 60; };
      const pageBg = () => { setFill("#F8FAFC"); doc.rect(0, 0, W, H, "F"); };

      // Barra de macros proporcional
      const macroBar = (x, yy, w, h, p, c2, f2, labels) => {
        const kp = p * 4, kc = c2 * 4, kf = f2 * 9;
        const tot = Math.max(1, kp + kc + kf);
        const wp = w * kp / tot, wc = w * kc / tot, wf = w * kf / tot;
        setFill("#E5E9EF"); doc.roundedRect(x, yy, w, h, h / 2, h / 2, "F");
        // segmentos (esquinas redondeadas en extremos)
        setFill("#EF4444"); doc.roundedRect(x, yy, Math.max(wp, h), h, h / 2, h / 2, "F");
        setFill("#F59E0B"); doc.rect(x + wp, yy, wc, h, "F");
        setFill("#174C7D");
        if (wf > h) doc.roundedRect(x + wp + wc - h, yy, wf + h, h, h / 2, h / 2, "F");
        else doc.rect(x + wp + wc, yy, wf, h, "F");
        // tapar redondeo interno de la proteina
        setFill("#F59E0B");
        if (wc > 2) doc.rect(x + wp, yy, Math.min(wc, h), h, "F");
        if (labels) {
          doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); setText("#FFFFFF");
          if (wp > 34) doc.text(`P ${p}g`, x + wp / 2, yy + h / 2 + 2.6, { align: "center" });
          if (wc > 34) doc.text(`C ${c2}g`, x + wp + wc / 2, yy + h / 2 + 2.6, { align: "center" });
          if (wf > 34) doc.text(`G ${f2}g`, x + wp + wc + wf / 2, yy + h / 2 + 2.6, { align: "center" });
        }
      };

      // Logo M-flecha
      const drawLogo = (x, yy, size) => {
        setFill("#FFFFFF"); doc.roundedRect(x, yy, size, size, size * 0.24, size * 0.24, "F");
        setDraw("#18B66A"); doc.setLineWidth(size * 0.085);
        doc.setLineCap("round"); doc.setLineJoin("round");
        const pad = size * 0.22;
        const bx = x + pad, rx = x + size - pad;
        const top = yy + pad, bot = yy + size - pad;
        const midX = x + size / 2, midY = yy + size * 0.55;
        doc.line(bx, bot, bx, top); doc.line(bx, top, midX, midY);
        doc.line(midX, midY, rx, top); doc.line(rx, top, rx, bot);
        const ah = size * 0.14;
        doc.line(midX - ah, top + ah, midX, top); doc.line(midX, top, midX + ah, top + ah);
        doc.setLineCap("butt"); doc.setLineJoin("miter");
      };

      const gName = GOALS.find((g) => g.key === goal).label;

      // ============ PAGINA 1: PORTADA ============
      pageBg();
      setFill("#18B66A"); doc.rect(0, 0, W, 300, "F");
      drawLogo(M, 38, 74);
      setText("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(40);
      doc.text("MacroFit", M + 92, 84);
      doc.setFont("helvetica", "normal"); doc.setFontSize(13);
      doc.text("Nutricion inteligente. Resultados reales.", M + 92, 106);

      // Tarjeta objetivo
      const cardY = 172;
      setFill("#FFFFFF"); doc.roundedRect(M, cardY, W - 2 * M, 96, 14, 14, "F");
      setText("#64748B"); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      doc.text("TU OBJETIVO DIARIO", M + 22, cardY + 24);
      setText("#18B66A"); doc.setFont("helvetica", "bold"); doc.setFontSize(40);
      doc.text(String(targetKcal), M + 22, cardY + 62);
      setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      doc.text("kcal / dia", M + 22 + doc.getTextWidth(String(targetKcal)) * 0 + 100, cardY + 56);
      setText("#1F2937"); doc.setFont("helvetica", "bold"); doc.setFontSize(13);
      doc.text(gName, W - M - 22, cardY + 52, { align: "right" });
      macroBar(M + 22, cardY + 70, W - 2 * M - 44, 14, macros.p, macros.c, macros.f, true);

      // Tarjetas de macros
      let ty = 330;
      const cw = (W - 2 * M - 24) / 3;
      const macroCards = [
        ["PROTEINA", `${macros.p} g`, "#EF4444", "#FEE9E9"],
        ["CARBOHIDRATOS", `${macros.c} g`, "#F59E0B", "#FEF3E2"],
        ["GRASAS", `${macros.f} g`, "#174C7D", "#E8F0F7"],
      ];
      macroCards.forEach(([lbl, val, col, soft], i) => {
        const x = M + i * (cw + 12);
        setFill(soft); doc.roundedRect(x, ty, cw, 82, 12, 12, "F");
        setText(col); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.text(lbl, x + cw / 2, ty + 24, { align: "center" });
        doc.setFontSize(26);
        doc.text(val, x + cw / 2, ty + 56, { align: "center" });
        setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.text("al dia", x + cw / 2, ty + 70, { align: "center" });
      });

      // Hidratacion y sueno
      ty = 432;
      const hw = (W - 2 * M - 12) / 2;
      setFill("#E8F0F7"); doc.roundedRect(M, ty, hw, 84, 12, 12, "F");
      setText("#174C7D"); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text("HIDRATACION", M + 18, ty + 26);
      doc.setFontSize(30);
      doc.text(`${lifestyle.water || "—"} L`, M + 18, ty + 60);
      setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.text("de agua al dia", M + 18, ty + 74);

      setFill("#E7F8EF"); doc.roundedRect(M + hw + 12, ty, hw, 84, 12, 12, "F");
      setText("#18B66A"); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text("SUENO", M + hw + 30, ty + 26);
      doc.setFontSize(30);
      doc.text(lifestyle.sleep, M + hw + 30, ty + 60);
      setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.text("para recuperar y progresar", M + hw + 30, ty + 74);

      setText("#94A3B8"); doc.setFont("helvetica", "italic"); doc.setFontSize(8.5);
      doc.text(doc.splitTextToSize("Este plan es una guia general de MacroFit basada en la ecuacion Mifflin-St Jeor. No reemplaza la valoracion de un profesional de la salud o nutricionista.", W - 2 * M), M, H - 120);
      footer();

      // ============ PAGINA 2: VISTA SEMANAL ============
      newPage();
      setFill("#174C7D"); doc.roundedRect(M, 46, W - 2 * M, 46, 10, 10, "F");
      setText("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
      doc.text("Vista general de la semana", M + 18, 76);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(`${targetKcal} kcal / dia`, W - M - 18, 76, { align: "right" });
      setText("#64748B"); doc.setFontSize(9);
      doc.text("Los platos de cada dia de un vistazo. El detalle con gramos esta en las paginas siguientes.", M, 110);

      let wy = 138;
      const colW = (W - 2 * M - 74) / 4;
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
      MEALS.forEach((mm, i) => {
        setText(MEAL_COLORS[mm.key]);
        doc.text(mm.label.toUpperCase(), M + 74 + i * colW + colW / 2, wy, { align: "center" });
      });
      wy += 14;

      const rowH = 74;
      menu.forEach((d, di) => {
        setFill("#FFFFFF"); doc.roundedRect(M, wy, W - 2 * M, rowH - 8, 10, 10, "F");
        setDraw("#E2E8F0"); doc.setLineWidth(0.8); doc.roundedRect(M, wy, W - 2 * M, rowH - 8, 10, 10, "S");
        setFill("#E7F8EF"); doc.roundedRect(M, wy, 70, rowH - 8, 10, 10, "F");
        setText("#18B66A"); doc.setFont("helvetica", "bold"); doc.setFontSize(10.5);
        doc.text(d.day.slice(0, 3).toUpperCase(), M + 35, wy + 28, { align: "center" });
        setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
        doc.text(`dia ${di + 1}`, M + 35, wy + 40, { align: "center" });

        d.meals.forEach((m, i) => {
          const cx = M + 74 + i * colW;
          if (i) { setDraw("#E2E8F0"); doc.setLineWidth(0.6); doc.line(cx - 3, wy + 10, cx - 3, wy + rowH - 18); }
          setText("#1F2937"); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
          const lines = doc.splitTextToSize(m.dish || m.label, colW - 12).slice(0, 3);
          lines.forEach((ln, li) => doc.text(ln, cx + colW / 2, wy + 26 + li * 10, { align: "center" }));
        });
        wy += rowH;
      });
      footer();

      // ============ PAGINAS 3-9: UN DIA POR PAGINA ============
      menu.forEach((d, di) => {
        newPage();
        setFill("#18B66A"); doc.roundedRect(M, 46, W - 2 * M, 72, 12, 12, "F");
        setText("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(24);
        doc.text(d.day, M + 20, 80);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
        doc.text(`Dia ${di + 1} de 7`, M + 20, 96);
        doc.setFont("helvetica", "bold"); doc.setFontSize(21);
        doc.text(`${d.dayTot.kcal} kcal`, W - M - 20, 80, { align: "right" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.text(`objetivo ${targetKcal} kcal`, W - M - 20, 94, { align: "right" });
        macroBar(M + 20, 100, W - 2 * M - 40, 13, d.dayTot.p, d.dayTot.c, d.dayTot.f, true);

        let dy = 136;
        d.meals.forEach((m) => {
          const col = MEAL_COLORS[m.key];
          const cardH = 62 + m.items.length * 16;
          setFill("#FFFFFF"); doc.roundedRect(M, dy, W - 2 * M, cardH, 12, 12, "F");
          setDraw("#E2E8F0"); doc.setLineWidth(0.8); doc.roundedRect(M, dy, W - 2 * M, cardH, 12, 12, "S");
          setFill(col); doc.roundedRect(M, dy, 5, cardH, 2.5, 2.5, "F");

          setText(col); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
          doc.text(m.label.toUpperCase(), M + 18, dy + 18);
          setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
          doc.text(`${m.tot.kcal} kcal`, W - M - 16, dy + 18, { align: "right" });
          // casilla listo
          setDraw("#CBD5E1"); doc.setLineWidth(0.9);
          doc.rect(W - M - 78, dy + 11, 9, 9, "S");
          setText("#94A3B8"); doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
          doc.text("listo", W - M - 66, dy + 18);

          setText("#1F2937"); doc.setFont("helvetica", "bold"); doc.setFontSize(15);
          doc.text(m.dish || m.label, M + 18, dy + 38);

          macroBar(M + 18, dy + 44, 150, 8, m.tot.p, m.tot.c, m.tot.f, false);
          setText("#94A3B8"); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
          doc.text(`P ${m.tot.p}g   C ${m.tot.c}g   G ${m.tot.f}g`, M + 176, dy + 51);

          setDraw("#E2E8F0"); doc.setLineWidth(0.6);
          doc.line(M + 18, dy + 60, W - M - 16, dy + 60);

          let iy = dy + 74;
          m.items.forEach((it) => {
            setText("#1F2937"); doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
            doc.text(it.name, M + 22, iy);
            const nw = doc.getTextWidth(it.name);
            setText("#94A3B8"); doc.setFontSize(7.5);
            const portion = it.portions ? `${it.portions} x (${it.portion})` : it.portion;
            doc.text(`· ${portion}`, M + 22 + nw + 8, iy);
            setText("#18B66A"); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
            doc.text(`${it.grams} g`, W - M - 96, iy, { align: "right" });
            setText("#94A3B8"); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
            doc.text(`P${it.kp}  C${it.kc}  G${it.kf}`, W - M - 16, iy, { align: "right" });
            iy += 16;
          });
          dy += cardH + 12;
        });
        footer();
      });

      // ============ LISTA DE COMPRAS ============
      newPage();
      setFill("#174C7D"); doc.roundedRect(M, 46, W - 2 * M, 46, 10, 10, "F");
      setText("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
      doc.text("Lista de compras de la semana", M + 18, 76);
      setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text("Cantidades totales para 7 dias (en crudo). Agrega ~10% de margen por perdidas de coccion.", M, 110);
      let sy = 128;
      shopping.forEach((it, i) => {
        if (sy > H - 70) { footer(); newPage(); sy = 60; }
        if (i % 2 === 0) { setFill("#FFFFFF"); doc.roundedRect(M, sy, W - 2 * M, 24, 5, 5, "F"); }
        setDraw("#CBD5E1"); doc.setLineWidth(0.9);
        doc.rect(M + 12, sy + 7, 10, 10, "S");
        setText("#1F2937"); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        doc.text(it.name, M + 32, sy + 16);
        setText("#18B66A"); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
        doc.text(it.display, W - M - 14, sy + 16, { align: "right" });
        if (it.units) {
          setText("#94A3B8"); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
          doc.text(`~${it.units} und`, W - M - 76, sy + 16, { align: "right" });
        }
        sy += 26;
      });
      footer();

      // ============ EQUIVALENCIAS ============
      if (equivalences && equivalences.length) {
        newPage();
        setFill("#18B66A"); doc.roundedRect(M, 46, W - 2 * M, 46, 10, 10, "F");
        setText("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
        doc.text("Tabla de equivalencias", M + 18, 76);
        setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        const intro = doc.splitTextToSize("Cada fila aporta aproximadamente las mismas calorias: puedes intercambiar cualquier alimento de la misma fila sin desajustar tu plan. Las equivalencias varian 10-20 kcal y los macros cambian ligeramente segun el alimento.", W - 2 * M);
        doc.text(intro, M, 110);
        let ey = 110 + intro.length * 11 + 14;

        equivalences.forEach((g) => {
          if (ey > H - 130) { footer(); newPage(); ey = 60; }
          setText("#174C7D"); doc.setFont("helvetica", "bold"); doc.setFontSize(12);
          doc.text(g.title, M, ey); ey += 14;
          const nCols = g.foods.length;
          const cW = (W - 2 * M) / nCols;
          setFill("#E8F0F7"); doc.rect(M, ey, W - 2 * M, 24, "F");
          setText("#174C7D"); doc.setFont("helvetica", "bold"); doc.setFontSize(7);
          g.foods.forEach((f, i) => {
            const ls = doc.splitTextToSize(f, cW - 6);
            doc.text(ls[0], M + i * cW + cW / 2, ey + 11, { align: "center" });
            if (ls[1]) doc.text(ls[1], M + i * cW + cW / 2, ey + 19, { align: "center" });
          });
          ey += 24;
          g.rows.forEach((row, ri) => {
            if (ri % 2 === 0) { setFill("#FFFFFF"); doc.rect(M, ey, W - 2 * M, 18, "F"); }
            setDraw("#E2E8F0"); doc.setLineWidth(0.5); doc.rect(M, ey, W - 2 * M, 18, "S");
            setText("#1F2937"); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
            row.cells.forEach((c2, i) => {
              const txt = c2.unit ? `${c2.grams} g (~${c2.unit})` : `${c2.grams} g`;
              doc.text(txt, M + i * cW + cW / 2, ey + 12, { align: "center" });
            });
            ey += 18;
          });
          ey += 18;
        });
        footer();
      }

      // ============ SUPLEMENTOS ============
      newPage();
      setFill("#18B66A"); doc.roundedRect(M, 46, W - 2 * M, 46, 10, 10, "F");
      setText("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
      doc.text("Suplementos y habitos", M + 18, 76);
      let py = 112;
      supplements.forEach((sup) => {
        const rowHh = 56;
        setFill("#FFFFFF"); doc.roundedRect(M, py, W - 2 * M, rowHh, 10, 10, "F");
        setDraw("#E2E8F0"); doc.setLineWidth(0.8); doc.roundedRect(M, py, W - 2 * M, rowHh, 10, 10, "S");
        setFill("#18B66A"); doc.roundedRect(M, py, 5, rowHh, 2.5, 2.5, "F");
        setText("#1F2937"); doc.setFont("helvetica", "bold"); doc.setFontSize(12);
        doc.text(sup.name, M + 18, py + 22);
        setText("#174C7D"); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
        doc.text(sup.dose, M + 18, py + 37);
        setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
        doc.text(doc.splitTextToSize(sup.note, W - 2 * M - 34), M + 18, py + 49);
        py += rowHh + 12;
      });

      py += 6;
      const hw2 = (W - 2 * M - 12) / 2;
      setFill("#E8F0F7"); doc.roundedRect(M, py, hw2, 84, 12, 12, "F");
      setText("#174C7D"); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text("HIDRATACION", M + 18, py + 26); doc.setFontSize(30);
      doc.text(`${lifestyle.water || "—"} L`, M + 18, py + 60);
      setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.text("de agua al dia", M + 18, py + 74);
      setFill("#E7F8EF"); doc.roundedRect(M + hw2 + 12, py, hw2, 84, 12, 12, "F");
      setText("#18B66A"); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text("SUENO", M + hw2 + 30, py + 26); doc.setFontSize(30);
      doc.text(lifestyle.sleep, M + hw2 + 30, py + 60);
      setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.text("para recuperar y progresar", M + hw2 + 30, py + 74);

      setText("#94A3B8"); doc.setFont("helvetica", "italic"); doc.setFontSize(8);
      doc.text(doc.splitTextToSize("Gramos en crudo/comestible. Guia general de MacroFit, no reemplaza la valoracion de un profesional de la salud o nutricionista. Consulta antes de iniciar suplementacion.", W - 2 * M), M, H - 70);
      footer();

      doc.save("MacroFit-plan-semanal.pdf");
      setPdfState("done");
      setTimeout(() => setPdfState("idle"), 2500);
    } catch (e) {
      console.error(e);
      setPdfState("idle");
      alert("No se pudo generar el PDF. Revisa tu conexión e intenta de nuevo.");
    }
  };

  const S = {
    app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, padding: "0 0 90px" },
    wrap: { maxWidth: 620, margin: "0 auto", padding: "0 18px" },
    h1: { fontSize: 27, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, color: C.text },
    card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 18, marginBottom: 14, boxShadow: "0 1px 2px rgba(15,23,42,0.04)" },
    label: { fontSize: 13, color: C.dim, marginBottom: 8, display: "block", fontWeight: 600 },
    input: { width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px", color: C.text, fontSize: 17, outline: "none", boxSizing: "border-box", fontFamily: FONT },
  };

  const Chip = ({ active, onClick, children, color = C.green }) => (
    <button onClick={onClick} style={{
      background: active ? color : C.card, color: active ? "#fff" : C.text,
      border: `1.5px solid ${active ? color : C.line}`, borderRadius: 14, padding: "11px 14px",
      fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s", width: "100%", textAlign: "left", fontFamily: FONT,
    }}>{children}</button>
  );

  const Btn = ({ onClick, children, disabled, ghost }) => (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? C.line : ghost ? "transparent" : C.green,
      color: disabled ? C.faint : ghost ? C.text : "#fff",
      border: ghost ? `1.5px solid ${C.line}` : "none", borderRadius: 14, padding: "15px 20px",
      fontSize: 16, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", flex: 1, fontFamily: FONT,
    }}>{children}</button>
  );

  const Ring = ({ label, value, unit, color }) => (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 10, color: C.faint }}>{unit}</div>
    </div>
  );

  const FoodGrid = ({ cat, list, color }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {list.map((f) => (
        <Chip key={f.id} active={prefs[cat].includes(f.id)} onClick={() => togglePref(cat, f.id)} color={color}>
          <span style={{ marginRight: 6 }}>{f.emoji}</span>{f.name}
        </Chip>
      ))}
    </div>
  );

  const Stepper = () => (
    <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? C.green : C.line }} />
      ))}
    </div>
  );

  const TabBtn = ({ id, children }) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: "10px 6px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: FONT,
      background: tab === id ? C.green : "transparent", color: tab === id ? "#fff" : C.dim,
      fontWeight: 700, fontSize: 12.5,
    }}>{children}</button>
  );

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ ...S.wrap, paddingTop: 26, paddingBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <Logo size={46} />
          <div>
            <div style={S.h1}>MacroFit</div>
            <div style={{ fontSize: 12.5, color: C.green, fontWeight: 700, letterSpacing: "-0.01em" }}>Nutrición inteligente. Resultados reales.</div>
          </div>
        </div>
        <p style={{ color: C.dim, fontSize: 14, margin: "10px 0 18px" }}>Tu asistente de nutrición, calculado con base científica.</p>
        <Stepper />
      </div>

      <div style={S.wrap}>
        {step === 0 && (
          <>
            <div style={S.card}>
              <label style={S.label}>Género</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[["m", "Hombre"], ["f", "Mujer"]].map(([k, l]) => (
                  <Chip key={k} active={form.gender === k} onClick={() => setForm({ ...form, gender: k })}>{l}</Chip>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={S.label}>Edad (años)</label>
                  <input style={S.input} type="number" inputMode="numeric" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="30" />
                </div>
                <div>
                  <label style={S.label}>Peso (kg)</label>
                  <input style={S.input} type="number" inputMode="decimal" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" />
                </div>
              </div>
              <label style={S.label}>Estatura (cm)</label>
              <input style={S.input} type="number" inputMode="numeric" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="175" />
            </div>

            <div style={S.card}>
              <label style={S.label}>Nivel de actividad física</label>
              <div style={{ display: "grid", gap: 8 }}>
                {ACTIVITY.map((a) => (
                  <Chip key={a.key} active={form.activity === a.key} onClick={() => setForm({ ...form, activity: a.key })}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{a.label}</span>
                      <span style={{ opacity: .65, fontWeight: 500, fontSize: 12 }}>{a.desc}</span>
                    </div>
                  </Chip>
                ))}
              </div>
            </div>

            {canCalc && maintenance && (
              <div style={{ ...S.card, background: C.greenSoft, border: `1px solid ${C.green}33`, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.dim, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>Calorías de mantenimiento</div>
                <div style={{ fontSize: 44, fontWeight: 800, color: C.green }}>{maintenance}</div>
                <div style={{ fontSize: 13, color: C.dim }}>kcal / día · Mifflin-St Jeor</div>
              </div>
            )}
            <Btn onClick={() => setStep(1)} disabled={!canCalc}>Continuar →</Btn>
          </>
        )}

        {step === 1 && (
          <>
            <div style={S.card}>
              <label style={S.label}>¿Cuál es tu objetivo?</label>
              <div style={{ display: "grid", gap: 10 }}>
                {GOALS.map((g) => (
                  <button key={g.key} onClick={() => setGoal(g.key)} style={{
                    background: goal === g.key ? g.color : C.card, color: goal === g.key ? "#fff" : C.text,
                    border: `1.5px solid ${goal === g.key ? g.color : C.line}`, borderRadius: 14, padding: 16, cursor: "pointer", textAlign: "left", fontFamily: FONT,
                  }}>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{g.label}</div>
                    <div style={{ fontSize: 13, opacity: .8, fontWeight: 500 }}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...S.card, fontSize: 13, color: C.dim, lineHeight: 1.55 }}>
              {goal === "def" && "Déficit del 20% — el rango seguro (15–25%) para perder grasa preservando músculo. Con proteína alta (2 g/kg) y entrenamiento de fuerza, la pérdida muscular es mínima."}
              {goal === "sup" && "Superávit del 10% — un aumento controlado (5–15%) que favorece ganancia de músculo minimizando la grasa. Los superávits agresivos solo aportan más grasa."}
              {goal === "man" && "Mantenimiento — comes justo lo que gastas. Ideal para recomposición corporal con entrenamiento de fuerza."}
              {!goal && "Selecciona un objetivo para ver la recomendación basada en evidencia."}
            </div>

            {targetKcal && macros && (
              <div style={S.card}>
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: C.dim, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>Tu objetivo diario</div>
                  <div style={{ fontSize: 42, fontWeight: 800, color: GOALS.find(g => g.key === goal).color }}>{targetKcal}</div>
                  <div style={{ fontSize: 13, color: C.dim }}>kcal / día</div>
                </div>
                <div style={{ display: "flex", borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
                  <Ring label="Proteína" value={macros.p} unit="gramos" color={C.protein} />
                  <Ring label="Carbos" value={macros.c} unit="gramos" color={C.carb} />
                  <Ring label="Grasas" value={macros.f} unit="gramos" color={C.fat} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <Btn ghost onClick={() => setStep(0)}>←</Btn>
              <Btn onClick={() => setStep(2)} disabled={!goal}>Continuar →</Btn>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={S.card}>
              <label style={S.label}>🍗 Proteínas que te gustan</label>
              <FoodGrid cat="protein" list={FOODS.protein} color={C.protein} />
              <p style={{ fontSize: 11.5, color: C.faint, margin: "10px 2px 0", lineHeight: 1.45 }}>Consejo: elige al menos una de desayuno (huevo, yogur, proteína en polvo o queso) y una de almuerzo/cena, así los platos quedan variados y con sentido.</p>
            </div>
            <div style={S.card}>
              <label style={S.label}>🍚 Carbohidratos que te gustan</label>
              <FoodGrid cat="carb" list={FOODS.carb} color={C.carb} />
            </div>
            <div style={S.card}>
              <label style={S.label}>🥑 Grasas que te gustan</label>
              <FoodGrid cat="fat" list={FOODS.fat} color={C.fat} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn ghost onClick={() => setStep(1)}>←</Btn>
              <Btn onClick={() => setStep(3)} disabled={prefs.protein.length < 1 || prefs.carb.length < 1}>Continuar →</Btn>
            </div>
            {(prefs.protein.length < 1 || prefs.carb.length < 1) && (
              <p style={{ color: C.dim, fontSize: 12, textAlign: "center", marginTop: 8 }}>Elige al menos 1 proteína y 1 carbohidrato.</p>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div style={S.card}>
              <label style={S.label}>🥦 Vegetales que te gustan</label>
              <FoodGrid cat="veg" list={FOODS.veg} color={C.green} />
            </div>
            <div style={S.card}>
              <label style={S.label}>🍎 Frutas que te gustan</label>
              <FoodGrid cat="fruit" list={FOODS.fruit} color={C.carb} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn ghost onClick={() => setStep(2)}>←</Btn>
              <Btn onClick={() => setStep(4)}>Generar mi menú ✨</Btn>
            </div>
          </>
        )}

        {step === 4 && menu && (
          <>
            <div style={{ ...S.card, background: `linear-gradient(135deg, ${C.green}, #129455)` }}>
              <div style={{ fontSize: 12, color: "#ffffffcc", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>Tu plan semanal</div>
              <div style={{ fontSize: 22, fontWeight: 800, margin: "2px 0 12px", color: "#fff" }}>
                {targetKcal} kcal · {GOALS.find(g => g.key === goal).label}
              </div>
              <div style={{ display: "flex" }}>
                <Ring label="Proteína" value={macros.p + "g"} unit="objetivo" color="#fff" />
                <Ring label="Carbos" value={macros.c + "g"} unit="objetivo" color="#fff" />
                <Ring label="Grasas" value={macros.f + "g"} unit="objetivo" color="#fff" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={generatePDF} disabled={pdfState === "loading"} style={{
                flex: 2, background: pdfState === "done" ? C.success : C.green, color: "#fff",
                border: "none", borderRadius: 14, padding: "15px 12px", fontSize: 15, fontWeight: 700,
                cursor: pdfState === "loading" ? "wait" : "pointer", fontFamily: FONT,
              }}>
                {pdfState === "loading" ? "Generando…" : pdfState === "done" ? "✓ Descargado" : "⬇ Descargar PDF"}
              </button>
              <button onClick={() => setSeed((s) => s + 1)} style={{
                flex: 1, background: "transparent", color: C.text, border: `1.5px solid ${C.line}`,
                borderRadius: 14, padding: "15px 8px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
              }}>🔄 Otro menú</button>
            </div>

            <div style={{ display: "flex", gap: 4, background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 4, marginBottom: 14 }}>
              <TabBtn id="menu">Menú</TabBtn>
              <TabBtn id="compras">🛒 Compras</TabBtn>
              <TabBtn id="equiv">🔀 Equivalencias</TabBtn>
            </div>

            {tab === "menu" && (
              <>
                <div style={S.card}>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Suplementos y hábitos</div>
                  {supplements.map((sup, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                      <div style={{ width: 4, borderRadius: 4, background: C.green, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{sup.name}</div>
                        <div style={{ fontSize: 12.5, color: C.blue, fontWeight: 600 }}>{sup.dose}</div>
                        <div style={{ fontSize: 12, color: C.dim, marginTop: 2, lineHeight: 1.4 }}>{sup.note}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <div style={{ flex: 1, background: C.blueSoft, borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 12, color: C.blue, fontWeight: 700 }}>💧 Hidratación</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: C.blue }}>{lifestyle.water || "—"} L</div>
                      <div style={{ fontSize: 11, color: C.dim }}>de agua al día</div>
                    </div>
                    <div style={{ flex: 1, background: C.greenSoft, borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>😴 Sueño</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>{lifestyle.sleep}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>para recuperar</div>
                    </div>
                  </div>
                </div>

                {menu.map((d, di) => (
                  <div key={di} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "8px 2px" }}>
                      <div style={{ fontSize: 19, fontWeight: 800 }}>{d.day}</div>
                      <div style={{ fontSize: 12, color: C.dim }}>{d.dayTot.kcal} kcal · P{d.dayTot.p} C{d.dayTot.c} G{d.dayTot.f}</div>
                    </div>
                    {d.meals.map((m, mi) => (
                      <div key={mi} style={{ ...S.card, marginBottom: 8, padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: C.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{m.emoji} {m.label}</span>
                          <span style={{ fontSize: 12, color: C.dim }}>{m.tot.kcal} kcal</span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>{m.dish || m.label}</div>
                        {m.items.map((it, ii) => (
                          <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: `1px solid ${C.line}` }}>
                            <div style={{ fontSize: 14 }}>
                              <span style={{ marginRight: 6 }}>{it.emoji}</span>{it.name}
                              <div style={{ fontSize: 11, color: C.faint, marginLeft: 22 }}>
                                {it.portions ? `${it.portions} × (${it.portion})` : it.portion}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 15, fontWeight: 800, color: C.green }}>{it.grams}g</div>
                              <div style={{ fontSize: 10, color: C.faint }}>P{it.kp} C{it.kc} G{it.kf}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

            {tab === "compras" && shopping && (
              <div style={S.card}>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>🛒 Lista de la semana</div>
                <p style={{ fontSize: 12.5, color: C.dim, marginTop: 0, marginBottom: 14, lineHeight: 1.5 }}>
                  Cantidades totales para los 7 días, en crudo. Agrega ~10% de margen por pérdidas al cocinar.
                </p>
                {shopping.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                    <div style={{ fontSize: 14.5 }}>
                      <span style={{ marginRight: 8 }}>{it.emoji}</span>{it.name}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.green }}>{it.display}</div>
                      {it.units && <div style={{ fontSize: 10.5, color: C.faint }}>~{it.units} unidades</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "equiv" && (
              <div style={S.card}>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>🔀 Equivalencias</div>
                <p style={{ fontSize: 12.5, color: C.dim, marginTop: 0, marginBottom: 16, lineHeight: 1.5 }}>
                  Cada fila aporta las mismas calorías: puedes intercambiar cualquier alimento de la misma fila sin desajustar tu plan. Son aproximadas (varían 10–20 kcal).
                </p>
                {equivalences && equivalences.length ? equivalences.map((g, gi) => (
                  <div key={gi} style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.blue, marginBottom: 8 }}>{g.title}</div>
                    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12, minWidth: g.foods.length * 92 }}>
                        <thead>
                          <tr>
                            {g.foods.map((f, i) => (
                              <th key={i} style={{ background: C.blueSoft, color: C.blue, padding: "8px 6px", fontSize: 10.5, fontWeight: 700, textAlign: "center" }}>{f}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {g.rows.map((row, ri) => (
                            <tr key={ri} style={{ background: ri % 2 ? C.bg : "transparent" }}>
                              {row.cells.map((c, ci) => (
                                <td key={ci} style={{ padding: "9px 6px", textAlign: "center", borderTop: `1px solid ${C.line}`, whiteSpace: "nowrap" }}>
                                  <strong>{c.grams} g</strong>
                                  {c.unit && <div style={{ fontSize: 9.5, color: C.faint }}>~{c.unit} und</div>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )) : (
                  <p style={{ fontSize: 13, color: C.dim }}>Elige al menos 2 alimentos por categoría para ver equivalencias.</p>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <Btn ghost onClick={() => setStep(2)}>Cambiar comidas</Btn>
              <Btn onClick={() => setStep(0)}>Empezar de nuevo</Btn>
            </div>
            <p style={{ color: C.faint, fontSize: 11, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
              Gramos en crudo/comestible. Guía general de MacroFit, no reemplaza la valoración de un profesional de la salud. Consulta antes de iniciar suplementación.
            </p>
          </>
        )}

        {step === 4 && !menu && (
          <div style={{ ...S.card, textAlign: "center", color: C.dim }}>
            Necesito al menos una proteína y un carbohidrato para armar el menú.
            <div style={{ marginTop: 12 }}><Btn ghost onClick={() => setStep(2)}>← Volver a elegir</Btn></div>
          </div>
        )}
      </div>
    </div>
  );
}
