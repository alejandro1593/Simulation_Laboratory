export interface NavItem {
  to: string;
  label: string;
  icon: string;
  desc?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Laboratorio",
    items: [
      { to: "/simulador", label: "Simulador", icon: "⚛️", desc: "Monta experimentos guiados" },
      { to: "/laboratorio", label: "Laboratorio libre", icon: "🧪", desc: "Reacciones sin guion" },
      { to: "/tutor", label: "Tutor", icon: "🎓", desc: "Ejercicios paso a paso" },
      { to: "/ensayos", label: "Ensayos", icon: "📋", desc: "Prueba tu conocimiento" },
      { to: "/toxicologia", label: "Toxicología", icon: "☠️", desc: "Dosis y DL50" },
    ],
  },
  {
    title: "Catálogos",
    items: [
      { to: "/catalogo/inorganico", label: "Inorgánico", icon: "🧂", desc: "Compuestos y iones" },
      { to: "/catalogo/inorganico/nombralo", label: "Inorgánico · Nómbralo", icon: "🎯", desc: "Adivina el compuesto" },
      { to: "/catalogo/organico", label: "Orgánico", icon: "🧬", desc: "Moléculas, fórmulas y usos" },
      { to: "/catalogo/organico/aprender", label: "Nomenclatura orgánica", icon: "✏️", desc: "Aprende a nombrar" },
      { to: "/catalogo/organico/nombralo", label: "Orgánico · Nómbralo", icon: "🎯", desc: "Adivina la molécula" },
    ],
  },
  {
    title: "Aprender",
    items: [
      { to: "/aprender", label: "Centro de aprendizaje", icon: "📚", desc: "Todo el temario" },
      { to: "/practica", label: "Práctica", icon: "✍️", desc: "Problemas con solución" },
      { to: "/aprender#fundamentos", label: "Fundamentos", icon: "🔍", desc: "Átomo, enlaces, materia" },
      { to: "/aprender#general", label: "Química general", icon: "⚗️", desc: "Estequiometría, pH, equilibrio" },
      { to: "/aprender#industria", label: "Industria", icon: "🏭", desc: "Procesos y materiales" },
      { to: "/aprender#calculadoras", label: "Calculadoras", icon: "🧮", desc: "Moles↔gramos, diluciones…" },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { to: "/progreso", label: "Mi progreso", icon: "📈", desc: "Estadísticas de aprendizaje" },
      { to: "/calculadora", label: "Calculadora", icon: "🧮", desc: "Kernel de cálculo químico" },
      { to: "/soluciones", label: "Soluciones", icon: "💧", desc: "Preparación y dilución" },
      { to: "/valoracion", label: "Valoración", icon: "⚖️", desc: "Titulación ácido-base" },
      { to: "/termoquimica", label: "Termoquímica", icon: "🔥", desc: "Calores de reacción" },
      { to: "/vsepr", label: "Geometría (VSEPR)", icon: "📐", desc: "Forma de las moléculas" },
      { to: "/isomeria", label: "Isomería", icon: "🔄", desc: "Conexión molecular" },
      { to: "/retos", label: "Retos", icon: "🏆", desc: "Misiones de química" },
      { to: "/tabla/quiz", label: "Quiz de la tabla", icon: "🎯", desc: "Encuentra el elemento" },
      { to: "/constructor", label: "Constructor", icon: "🛠️", desc: "Arma y simula" },
    ],
  },
];