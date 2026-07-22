import React, { useState, useMemo } from "react";

// ============================================================
//  MacroFit — Nutrición inteligente. Resultados reales.
//  Asistente inteligente de nutrición (no solo contador).
//  Base científica:
//   - Metabolismo basal: Mifflin-St Jeor
//   - Déficit 20% (15-25%) · Superávit 10% (5-15%)
//   - Proteína 1.8 g/kg (déficit 2.0), grasas 0.9 g/kg, resto carbos
//   - Agua ~35 ml/kg · Sueño 7-9 h · Creatina 5g · Omega-3 2g EPA+DHA
// ============================================================

const C = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  line: "#E2E8F0",
  green: "#18B66A",
  greenSoft: "#E7F8EF",
  blue: "#174C7D",
  blueSoft: "#E8F0F7",
  success: "#22C55E",
  warn: "#F59E0B",
  error: "#EF4444",
  text: "#1F2937",
  dim: "#64748B",
  faint: "#94A3B8",
  protein: "#EF4444",
  carb: "#F59E0B",
  fat: "#174C7D",
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

const FOODS = {
  protein: [
    { id: "wheyprot", name: "Proteína en polvo", emoji: "🥤", p: 80, c: 8, f: 6, portion: "1 scoop (~30g)", unit: 30, supp: true },
    { id: "pollo", name: "Pechuga de pollo", emoji: "🍗", p: 23, c: 0, f: 2, portion: "palma de la mano" },
    { id: "huevo", name: "Huevo entero", emoji: "🥚", p: 13, c: 1, f: 11, portion: "2 unidades", unit: 50 },
    { id: "res", name: "Carne de res magra", emoji: "🥩", p: 21, c: 0, f: 8, portion: "palma de la mano" },
    { id: "atun", name: "Atún", emoji: "🐟", p: 26, c: 0, f: 1, portion: "1 lata" },
    { id: "salmon", name: "Salmón", emoji: "🐠", p: 20, c: 0, f: 13, portion: "palma de la mano" },
    { id: "cerdo", name: "Lomo de cerdo", emoji: "🍖", p: 22, c: 0, f: 6, portion: "palma de la mano" },
    { id: "yogur", name: "Yogur griego", emoji: "🥛", p: 10, c: 4, f: 0.4, portion: "1 vaso" },
    { id: "queso", name: "Queso fresco", emoji: "🧀", p: 18, c: 3, f: 9, portion: "1 rebanada gruesa" },
    { id: "lenteja", name: "Lentejas", emoji: "🫘", p: 9, c: 20, f: 0.4, portion: "1 puño cocido" },
    { id: "tofu", name: "Tofu", emoji: "⬜", p: 8, c: 2, f: 5, portion: "1 bloque pequeño" },
  ],
  carb: [
    { id: "arroz", name: "Arroz", emoji: "🍚", p: 2.7, c: 28, f: 0.3, portion: "1 puño cocido" },
    { id: "papa", name: "Papa", emoji: "🥔", p: 2, c: 17, f: 0.1, portion: "1 mediana" },
    { id: "avena", name: "Avena", emoji: "🥣", p: 13, c: 66, f: 7, portion: "1/2 taza seca" },
    { id: "pan", name: "Pan integral", emoji: "🍞", p: 9, c: 43, f: 3, portion: "2 rebanadas", unit: 30 },
    { id: "pasta", name: "Pasta", emoji: "🍝", p: 5, c: 30, f: 1, portion: "1 puño cocido" },
    { id: "arepa", name: "Arepa de maíz", emoji: "🫓", p: 4, c: 40, f: 2, portion: "1 unidad", unit: 70 },
    { id: "yuca", name: "Yuca", emoji: "🍠", p: 1.4, c: 38, f: 0.3, portion: "1 trozo" },
    { id: "platano", name: "Plátano cocido", emoji: "🍌", p: 1.3, c: 32, f: 0.4, portion: "1/2 unidad" },
    { id: "quinoa", name: "Quinoa", emoji: "🌾", p: 4.4, c: 21, f: 1.9, portion: "1 puño cocido" },
  ],
  fat: [
    { id: "aguacate", name: "Aguacate", emoji: "🥑", p: 2, c: 9, f: 15, portion: "1/2 unidad" },
    { id: "aceite", name: "Aceite de oliva", emoji: "🫒", p: 0, c: 0, f: 100, portion: "1 cucharada", unit: 10 },
    { id: "almendra", name: "Almendras", emoji: "🌰", p: 21, c: 22, f: 49, portion: "1 puño pequeño" },
    { id: "mani", name: "Maní / mantequilla", emoji: "🥜", p: 25, c: 16, f: 50, portion: "1 cucharada" },
    { id: "chia", name: "Semillas de chía", emoji: "⚫", p: 17, c: 42, f: 31, portion: "1 cucharada" },
  ],
  veg: [
    { id: "brocoli", name: "Brócoli", emoji: "🥦", p: 2.8, c: 7, f: 0.4, portion: "1 puño" },
    { id: "espinaca", name: "Espinaca", emoji: "🥬", p: 2.9, c: 3.6, f: 0.4, portion: "2 puños" },
    { id: "tomate", name: "Tomate", emoji: "🍅", p: 0.9, c: 3.9, f: 0.2, portion: "1 unidad" },
    { id: "zanahoria", name: "Zanahoria", emoji: "🥕", p: 0.9, c: 10, f: 0.2, portion: "1 unidad" },
    { id: "lechuga", name: "Lechuga / mix verde", emoji: "🥗", p: 1.4, c: 2.9, f: 0.2, portion: "1 plato" },
    { id: "pepino", name: "Pepino", emoji: "🥒", p: 0.7, c: 3.6, f: 0.1, portion: "1/2 unidad" },
    { id: "pimenton", name: "Pimentón", emoji: "🫑", p: 1, c: 6, f: 0.3, portion: "1/2 unidad" },
  ],
  fruit: [
    { id: "banano", name: "Banano", emoji: "🍌", p: 1.1, c: 23, f: 0.3, portion: "1 unidad" },
    { id: "manzana", name: "Manzana", emoji: "🍎", p: 0.3, c: 14, f: 0.2, portion: "1 unidad" },
    { id: "fresa", name: "Fresas", emoji: "🍓", p: 0.7, c: 8, f: 0.3, portion: "1 puño" },
    { id: "arandano", name: "Arándanos", emoji: "🫐", p: 0.7, c: 14, f: 0.3, portion: "1 puño" },
    { id: "naranja", name: "Naranja", emoji: "🍊", p: 0.9, c: 12, f: 0.1, portion: "1 unidad" },
    { id: "papaya", name: "Papaya", emoji: "🧡", p: 0.5, c: 11, f: 0.3, portion: "1 tajada" },
    { id: "pina", name: "Piña", emoji: "🍍", p: 0.5, c: 13, f: 0.1, portion: "1 rodaja" },
  ],
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

function scaleFood(food, targetKcal) {
  const per100 = kcalOf(food);
  if (per100 <= 0) return null;
  let grams = (targetKcal / per100) * 100;
  grams = Math.max(15, Math.round(grams / 5) * 5);
  const factor = grams / 100;
  return {
    ...food, grams,
    kp: Math.round(food.p * factor),
    kc: Math.round(food.c * factor),
    kf: Math.round(food.f * factor),
    kcal: Math.round(per100 * factor),
    portions: food.unit ? Math.max(1, Math.round(grams / food.unit)) : null,
  };
}

// ---------- Ícono de marca: M con flecha central hacia arriba ----------
const Logo = ({ size = 44, radius = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx={radius} fill="#18B66A" />
    {/* M cuyo vértice central es una flecha hacia arriba */}
    <path d="M11 36 L11 14 L24 27 L37 14 L37 36"
      stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* punta de flecha en el vértice central */}
    <path d="M18.5 20.5 L24 15 L29.5 20.5"
      stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export default function MacroFit() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ gender: "", age: "", height: "", weight: "", activity: "" });
  const [goal, setGoal] = useState("");
  const [prefs, setPrefs] = useState({ protein: [], carb: [], fat: [], veg: [], fruit: [] });
  const [pdfState, setPdfState] = useState("idle");

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
    const proteinPerKg = goal === "def" ? 2.0 : 1.8;
    const pg = Math.round(proteinPerKg * w);
    const fg = Math.round(0.9 * w);
    const cKcal = Math.max(0, targetKcal - pg * 4 - fg * 9);
    return { p: pg, f: fg, c: Math.round(cKcal / 4) };
  }, [targetKcal, form.weight, goal]);

  // Recomendaciones de estilo de vida y suplementos
  const lifestyle = useMemo(() => {
    const w = +form.weight || 0;
    const water = w ? (Math.round((w * 35) / 100) / 10).toFixed(1) : null; // litros
    const takesWhey = prefs.protein.includes("wheyprot");
    return {
      water,
      sleep: goal === "sup" ? "8–9 h" : "7–9 h",
      takesWhey,
    };
  }, [form.weight, goal, prefs.protein]);

  const canCalc = form.gender && form.age && form.height && form.weight && form.activity;

  const menu = useMemo(() => {
    if (!targetKcal || !macros || step < 4) return null;
    const proteins = FOODS.protein.filter((f) => prefs.protein.includes(f.id));
    const carbs = FOODS.carb.filter((f) => prefs.carb.includes(f.id));
    const fats = FOODS.fat.filter((f) => prefs.fat.includes(f.id));
    const vegs = FOODS.veg.filter((f) => prefs.veg.includes(f.id));
    const fruits = FOODS.fruit.filter((f) => prefs.fruit.includes(f.id));
    if (!proteins.length || !carbs.length) return null;

    // proteínas para comidas principales (sólidas) vs polvo (mejor en desayuno/tarde)
    const solidProt = proteins.filter((p) => !p.supp);
    const whey = proteins.find((p) => p.supp);

    let s = 0;
    return DAYS.map((day, di) => {
      const meals = MEALS.map((meal, mi) => {
        const mealKcal = targetKcal * meal.share;
        // elegir proteína: en media tarde o desayuno usar polvo si existe
        let prot;
        if (whey && (meal.key === "tar" || (meal.key === "des" && di % 2 === 0))) {
          prot = whey;
        } else {
          prot = pick(solidProt.length ? solidProt : proteins, s + di + mi);
        }
        const carb = pick(carbs, s * 2 + di * 3 + mi);
        const fat = fats.length ? pick(fats, s + di + mi * 2) : null;
        const veg = vegs.length ? pick(vegs, s + di * 2 + mi) : null;
        const fruit = fruits.length ? pick(fruits, s * 3 + di + mi) : null;
        s += 7;
        const items = [];
        const pItem = scaleFood(prot, mealKcal * 0.42);
        if (pItem) items.push(pItem);
        if (meal.key === "tar") {
          const cItem = scaleFood(carb, mealKcal * 0.35);
          if (cItem) items.push(cItem);
          if (fruit) { const fr = scaleFood(fruit, mealKcal * 0.23); if (fr) items.push(fr); }
        } else {
          const cItem = scaleFood(carb, mealKcal * 0.40);
          if (cItem) items.push(cItem);
          if (fat) { const fi = scaleFood(fat, mealKcal * 0.14); if (fi) items.push(fi); }
          if (veg && meal.key !== "des") { const vi = scaleFood(veg, mealKcal * 0.06); if (vi) items.push(vi); }
          if (fruit && meal.key === "des") { const fr = scaleFood(fruit, mealKcal * 0.12); if (fr) items.push(fr); }
        }
        const tot = items.reduce((a, it) => ({ p: a.p + it.kp, c: a.c + it.kc, f: a.f + it.kf, kcal: a.kcal + it.kcal }), { p: 0, c: 0, f: 0, kcal: 0 });
        return { ...meal, items, tot };
      });
      const dayTot = meals.reduce((a, m) => ({ p: a.p + m.tot.p, c: a.c + m.tot.c, f: a.f + m.tot.f, kcal: a.kcal + m.tot.kcal }), { p: 0, c: 0, f: 0, kcal: 0 });
      return { day, meals, dayTot };
    });
  }, [targetKcal, macros, prefs, step]);

  const togglePref = (cat, id) =>
    setPrefs((p) => ({ ...p, [cat]: p[cat].includes(id) ? p[cat].filter((x) => x !== id) : [...p[cat], id] }));

  // Lista de suplementos recomendados
  const supplements = useMemo(() => {
    const list = [
      { name: "Creatina monohidratada", dose: "5 g al día, cualquier hora", note: "El suplemento con más respaldo para fuerza y masa muscular. Constante, todos los días." },
      { name: "Omega 3 (EPA + DHA)", dose: "2000 mg (2 g) al día con comida", note: "Dosis eficaz para recuperación y control de la inflamación (mínimo respaldado por la evidencia). Sostener al menos 6 semanas. Prioriza fórmulas con más EPA." },
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
      const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
      const setFill = (h) => doc.setFillColor(...hex(h));
      const setText = (h) => doc.setTextColor(...hex(h));
      const setDraw = (h) => doc.setDrawColor(...hex(h));

      const newPageBg = () => { setFill("#F8FAFC"); doc.rect(0, 0, W, H, "F"); };
      newPageBg();

      // ---- Cabecera con logo M-flecha ----
      setFill("#18B66A"); doc.roundedRect(M, 40, W - M * 2, 118, 14, 14, "F");
      // logo
      const lx = M + 22, ly = 62, ls = 54;
      setFill("#FFFFFF"); doc.roundedRect(lx, ly, ls, ls, 12, 12, "F");
      setDraw("#18B66A"); doc.setLineWidth(4);
      const bx = lx + 10, by = ly + ls - 12, bt = ly + 14, mid = lx + ls / 2;
      doc.line(bx, by, bx, bt); doc.line(bx, bt, mid, ly + ls / 2);
      doc.line(mid, ly + ls / 2, lx + ls - 10, bt); doc.line(lx + ls - 10, bt, lx + ls - 10, by);
      // punta flecha
      doc.line(mid - 8, ly + 22, mid, ly + 14); doc.line(mid, ly + 14, mid + 8, ly + 22);

      setText("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(28);
      doc.text("MacroFit", lx + ls + 20, 82);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10.5);
      doc.text("Nutricion inteligente. Resultados reales.", lx + ls + 20, 100);
      const gName = GOALS.find((g) => g.key === goal).label;
      doc.setFont("helvetica", "bold"); doc.setFontSize(12);
      doc.text(`${targetKcal} kcal / dia   ·   ${gName}`, lx + ls + 20, 124);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
      doc.text(`Proteina ${macros.p}g   ·   Carbohidratos ${macros.c}g   ·   Grasas ${macros.f}g`, lx + ls + 20, 142);

      y = 186;
      const ensureSpace = (need) => { if (y + need > H - 40) { doc.addPage(); newPageBg(); y = 50; } };

      menu.forEach((d) => {
        ensureSpace(120);
        setFill("#174C7D"); doc.roundedRect(M, y, W - M * 2, 26, 6, 6, "F");
        setText("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(12.5);
        doc.text(d.day, M + 12, y + 17);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        doc.text(`${d.dayTot.kcal} kcal   P${d.dayTot.p}  C${d.dayTot.c}  G${d.dayTot.f}`, W - M - 12, y + 17, { align: "right" });
        y += 34;

        d.meals.forEach((m) => {
          const rowH = 16 + m.items.length * 15 + 8;
          ensureSpace(rowH);
          setFill("#FFFFFF"); doc.roundedRect(M, y, W - M * 2, rowH, 6, 6, "F");
          setDraw("#E2E8F0"); doc.setLineWidth(0.8); doc.roundedRect(M, y, W - M * 2, rowH, 6, 6, "S");
          setFill("#18B66A"); doc.roundedRect(M, y, 4, rowH, 2, 2, "F");
          setText("#1F2937"); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
          doc.text(m.label, M + 14, y + 15);
          setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
          doc.text(`${m.tot.kcal} kcal`, W - M - 12, y + 15, { align: "right" });
          let iy = y + 30;
          m.items.forEach((it) => {
            setText("#1F2937"); doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
            const portion = it.portions ? `${it.portions} x (${it.portion})` : it.portion;
            doc.text(`${it.name}  —  ${portion}`, M + 16, iy);
            setText("#18B66A"); doc.setFont("helvetica", "bold");
            doc.text(`${it.grams}g`, W - M - 92, iy, { align: "right" });
            setText("#94A3B8"); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
            doc.text(`P${it.kp} C${it.kc} G${it.kf}`, W - M - 12, iy, { align: "right" });
            iy += 15;
          });
          y += rowH + 6;
        });
        y += 6;
      });

      // ---- Página de suplementos y hábitos ----
      doc.addPage(); newPageBg(); y = 50;
      setFill("#18B66A"); doc.roundedRect(M, y, W - M * 2, 40, 10, 10, "F");
      setText("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(16);
      doc.text("Suplementos y habitos recomendados", M + 16, y + 26);
      y += 58;

      supplements.forEach((sup) => {
        const rowH = 52;
        ensureSpace(rowH + 10);
        setFill("#FFFFFF"); doc.roundedRect(M, y, W - M * 2, rowH, 8, 8, "F");
        setDraw("#E2E8F0"); doc.setLineWidth(0.8); doc.roundedRect(M, y, W - M * 2, rowH, 8, 8, "S");
        setFill("#18B66A"); doc.roundedRect(M, y, 4, rowH, 2, 2, "F");
        setText("#1F2937"); doc.setFont("helvetica", "bold"); doc.setFontSize(11.5);
        doc.text(sup.name, M + 16, y + 20);
        setText("#174C7D"); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
        doc.text(sup.dose, M + 16, y + 35);
        setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
        const lines = doc.splitTextToSize(sup.note, W - M * 2 - 30);
        doc.text(lines, M + 16, y + 47);
        y += rowH + 10;
      });

      // hidratación y sueño
      ensureSpace(70);
      const halfW = (W - M * 2 - 12) / 2;
      setFill("#E8F0F7"); doc.roundedRect(M, y, halfW, 60, 8, 8, "F");
      setText("#174C7D"); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text("Hidratacion", M + 14, y + 22);
      doc.setFontSize(22);
      doc.text(`${lifestyle.water || "—"} L`, M + 14, y + 46);
      setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("de agua al dia", M + 14, y + 56);

      setFill("#E7F8EF"); doc.roundedRect(M + halfW + 12, y, halfW, 60, 8, 8, "F");
      setText("#18B66A"); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text("Sueno", M + halfW + 26, y + 22);
      doc.setFontSize(22);
      doc.text(lifestyle.sleep, M + halfW + 26, y + 46);
      setText("#64748B"); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("clave para recuperar y progresar", M + halfW + 26, y + 56);
      y += 78;

      setText("#94A3B8"); doc.setFont("helvetica", "italic"); doc.setFontSize(8);
      const disc = doc.splitTextToSize("Gramos en crudo/comestible. Guia general de MacroFit, no reemplaza la valoracion de un profesional de la salud o nutricionista. Consulta antes de iniciar suplementacion.", W - M * 2);
      doc.text(disc, M, H - 40);

      doc.save("MacroFit-plan-semanal.pdf");
      setPdfState("done");
      setTimeout(() => setPdfState("idle"), 2500);
    } catch (e) {
      console.error(e);
      setPdfState("idle");
      alert("No se pudo generar el PDF. Revisa tu conexión e intenta de nuevo.");
    }
  };

  // ---------- estilos ----------
  const S = {
    app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, padding: "0 0 90px" },
    wrap: { maxWidth: 620, margin: "0 auto", padding: "0 18px" },
    h1: { fontSize: 27, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, color: C.text },
    card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 18, marginBottom: 14, boxShadow: "0 1px 2px rgba(15,23,42,0.04)" },
    label: { fontSize: 13, color: C.dim, marginBottom: 8, display: "block", fontWeight: 600 },
    input: { width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px", color: C.text, fontSize: 17, outline: "none", boxSizing: "border-box", fontFamily: FONT },
  };

  const Chip = ({ active, onClick, children, color = C.green, softBg = C.greenSoft }) => (
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

  const FoodGrid = ({ cat, list, color, softBg }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {list.map((f) => (
        <Chip key={f.id} active={prefs[cat].includes(f.id)} onClick={() => togglePref(cat, f.id)} color={color} softBg={softBg}>
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
        {/* STEP 0 */}
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

        {/* STEP 1 */}
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

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div style={S.card}>
              <label style={S.label}>🍗 Proteínas que te gustan</label>
              <FoodGrid cat="protein" list={FOODS.protein} color={C.protein} />
              <p style={{ fontSize: 11.5, color: C.faint, margin: "10px 2px 0" }}>Incluye proteína en polvo si la consumes: la ubicaremos en desayuno o media tarde.</p>
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

        {/* STEP 3 */}
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

        {/* STEP 4 */}
        {step === 4 && menu && (
          <>
            <div style={{ ...S.card, background: `linear-gradient(135deg, ${C.green}, #12945580)` }}>
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

            <button onClick={generatePDF} disabled={pdfState === "loading"} style={{
              width: "100%", background: pdfState === "done" ? C.success : C.green, color: "#fff",
              border: "none", borderRadius: 14, padding: "15px 20px", fontSize: 16, fontWeight: 700,
              cursor: pdfState === "loading" ? "wait" : "pointer", fontFamily: FONT,
              marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {pdfState === "loading" ? "Generando PDF…" : pdfState === "done" ? "✓ PDF descargado" : "⬇ Descargar plan en PDF"}
            </button>

            {/* Suplementos y hábitos */}
            <div style={{ ...S.card }}>
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
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{m.emoji} {m.label}</span>
                      <span style={{ fontSize: 12, color: C.dim }}>{m.tot.kcal} kcal</span>
                    </div>
                    {m.items.map((it, ii) => (
                      <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: ii ? `1px solid ${C.line}` : "none" }}>
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
