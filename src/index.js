// src/index.js
import tokens from "../tokens.json" assert { type: "json" };

/**
 * Базовые утилиты
 * - rawByPath("core.color.primary") вернёт узел из JSON
 * - resolveNode(node) вернёт конечное значение, разворачивая ссылки {a.b.c}
 * - token("core.color.primary", "light") вернёт значение с учётом modes (если есть)
 */

function rawByPath(path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), tokens);
}

function resolveNode(node) {
  if (!node) return undefined;
  const v = typeof node === "object" && "value" in node ? node.value : node;
  if (typeof v === "string" && v.startsWith("{") && v.endsWith("}")) {
    const innerPath = v.slice(1, -1); // убираем { }
    return resolveNode(rawByPath(innerPath));
  }
  return v;
}

/**
 * Получить значение токена по пути.
 * Примеры:
 *  token("core.color.primary")
 *  token("radius.md")
 * Если у вас в tokens.json есть раздел modes, можно передать mode:
 *  token("core.color.primary", "light")
 */
export function token(path, mode) {
  // Если заданы режимы (modes) и в них есть прямое переопределение — используем его.
  const override = mode && tokens.modes?.[mode]?.[path];
  if (override) return override;
  return resolveNode(rawByPath(path));
}

/**
 * Удобный маппер: из словаря путей делает объект значений.
 * fromPaths({ primary: "core.color.primary", text: "core.color.text" }, "dark")
 */
export function fromPaths(pathMap, mode) {
  const out = {};
  for (const [key, path] of Object.entries(pathMap)) {
    out[key] = token(path, mode);
  }
  return out;
}

/**
 * Небольшие «готовые наборы», которые удобно импортировать в компонентах.
 * Подгоните пути под свою структуру tokens.json, если названия отличаются.
 */
export function colors(mode = "light") {
  return fromPaths(
    {
      primary: "core.color.primary",
      text: "core.color.text",
      surface: "core.color.surface",
      // добавьте свои: "success": "core.color.success", и т.п.
    },
    mode
  );
}

export function radii() {
  return fromPaths({
    md: "core.radius.md",
    lg: "core.radius.lg",
    // добавьте свои ключи
  });
}

export function spacing() {
  return fromPaths({
    sm: "core.spacing.sm",
    md: "core.spacing.md",
    lg: "core.spacing.lg",
    // добавьте свои ключи
  });
}

// на всякий случай экспортируем весь файл
export default tokens;
