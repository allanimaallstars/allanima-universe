// ═══════════════════════════════════════════════════════
// ALLANIMA — Notion API Integration
// Fetches data directly from Notion Master Database
// ═══════════════════════════════════════════════════════

const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// ── View IDs from the Master Database ────────────────
const VIEW_IDS = {
  beings: "6f0ea4b8-793e-4160-9bf6-d4942939c1bb",
  layers: "3a15ae78-c583-42e8-a3c2-f7c118dc953e",
  eras: "804afe2a-eb2c-4bef-864c-df2ea36dda95",
};

// ── Helper: extract text from Notion property ─────────
function getText(prop) {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return prop.title?.map((t) => t.plain_text).join("") || "";
    case "rich_text":
      return prop.rich_text?.map((t) => t.plain_text).join("") || "";
    case "select":
      return prop.select?.name || "";
    case "multi_select":
      return JSON.stringify(prop.multi_select?.map((s) => s.name) || []);
    case "status":
      return prop.status?.name || "";
    case "number":
      return prop.number;
    case "relation":
      return JSON.stringify(prop.relation?.map((r) => r.id) || []);
    default:
      return "";
  }
}

// ── Fetch all pages from a database ───────────────────
async function fetchDatabase(databaseId) {
  const pages = [];
  let cursor = undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      const props = {};
      for (const [key, value] of Object.entries(page.properties)) {
        props[key] = getText(value);
      }
      props.url = page.url;
      props.id = page.id;
      pages.push(props);
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return pages;
}

// ── Sin Detection ─────────────────────────────────────
const SIN_KEYWORDS = {
  Pride: ["Pride", "ความหยิ่ง", "หยิ่ง"],
  Wrath: ["Wrath", "ความโกรธ", "โกรธ"],
  Lust: ["Lust", "กระหาย"],
  Greed: ["Greed", "ความโลภ", "โลภ"],
  Gluttony: ["Gluttony", "ตะกละ"],
  Envy: ["Envy", "อิจฉา"],
  Sloth: ["Sloth", "เกียจคร้าน"],
};

function detectSin(role) {
  if (!role) return null;
  for (const [sin, keywords] of Object.entries(SIN_KEYWORDS)) {
    for (const kw of keywords) {
      if (role.includes(kw)) return sin;
    }
  }
  return null;
}

// ── Transform raw Notion data ─────────────────────────
function transformBeings(raw) {
  return raw
    .filter((r) => r["Being Name"])
    .map((r) => {
      let tags = [];
      try { tags = JSON.parse(r.Tags || "[]"); } catch {}
      return {
        id: r.id,
        name: r["Being Name"] || "",
        type: r["Being Type"] || "Unknown",
        gen: r.Generation || "",
        race: r["Race/Tribe"] || "",
        align: r.Alignment || "",
        status: r.Status || null,
        tags,
        role: r.Role || "",
        form: r["Physical Form"] || "",
        personality: r.Personality || "",
        sin: detectSin(r.Role),
        url: r.url || "",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const LAYER_COLORS = {
  0: "#555", 1: "#f5c542", 2: "#60a5fa", 3: "#a78bfa",
  4: "#34d399", 5: "#fbbf24", 6: "#7c3aed", 7: "#f472b6",
};

function transformLayers(raw) {
  return raw
    .filter((r) => r["Layer Name"])
    .map((r) => {
      const numMatch = (r["Layer Number"] || "").match(/(\d+)/);
      const num = numMatch ? parseInt(numMatch[1]) : -1;
      const parts = (r["Layer Name"] || "").split(" - ");
      return {
        id: r.id,
        num,
        name: (r["New Name"] || parts[0] || "").trim(),
        thai: r["Thai Name"] || "",
        title: parts[1] || "",
        type: r["Layer Type"] || "",
        fn: r.Function || "",
        locs: r["Key Locations"] || "",
        color: LAYER_COLORS[num] || "#888",
        url: r.url || "",
      };
    })
    .sort((a, b) => a.num - b.num);
}

const ERA_COLORS = {
  "ERA -∞": "#666", "ERA -3": "#a78bfa", "ERA -2": "#60a5fa",
  "ERA -1": "#f59e0b", "ERA 0": "#34d399",
};

function transformERAs(raw) {
  return raw
    .filter((r) => r["ERA Code"] && r["ERA Code"].startsWith("ERA"))
    .map((r) => {
      let tags = [];
      try { tags = JSON.parse(r.Tags || "[]"); } catch {}
      return {
        id: r.id,
        code: r["ERA Code"] || "",
        name: ((r["ERA Name"] || "").split(" - ")[0] || "")
          .replace(/^ERA\s*-?\d*:?\s*/, "").trim(),
        fullName: r["ERA Name"] || "",
        thai: r["Thai Name"] || "",
        en: r["English Name"] || "",
        type: r["Era Type"] || "",
        dur: r.Duration || "",
        summary: r.Summary || "",
        fullDesc: r["Full Description"] || "",
        tags,
        color: ERA_COLORS[r["ERA Code"]] || "#888",
        order: r["Timeline Order"] ?? 0,
        url: r.url || "",
      };
    })
    .sort((a, b) => a.order - b.order);
}

// ── Main fetch function ───────────────────────────────
async function fetchAllData() {
  const dbId = process.env.NOTION_DATABASE_ID;

  // Notion has separate data sources within the same database
  // We need to find the actual database IDs for each view
  // First, let's try fetching the main database and its linked databases

  try {
    // Get the main database structure
    const dbInfo = await notion.databases.retrieve({
      database_id: dbId,
    });

    // The Master Database contains multiple data sources (views)
    // We'll query them based on the property schemas
    const allPages = await fetchDatabase(dbId);

    // Separate pages by their content type based on available properties
    const beingsRaw = allPages.filter((p) => p["Being Name"]);
    const layersRaw = allPages.filter((p) => p["Layer Name"]);
    const erasRaw = allPages.filter((p) => p["ERA Name"]);

    return {
      beings: transformBeings(beingsRaw),
      layers: transformLayers(layersRaw),
      eras: transformERAs(erasRaw),
      lastSync: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Notion fetch error:", error);

    // Try fetching each related database separately
    // The main DB links to sub-databases via relations
    try {
      const results = await Promise.allSettled([
        fetchLinkedDatabase("beings"),
        fetchLinkedDatabase("layers"),
        fetchLinkedDatabase("eras"),
      ]);

      return {
        beings: results[0].status === "fulfilled" ? transformBeings(results[0].value) : [],
        layers: results[1].status === "fulfilled" ? transformLayers(results[1].value) : [],
        eras: results[2].status === "fulfilled" ? transformERAs(results[2].value) : [],
        lastSync: new Date().toISOString(),
      };
    } catch (e2) {
      console.error("Fallback fetch error:", e2);
      return { beings: [], layers: [], eras: [], lastSync: null, error: e2.message };
    }
  }
}

// Try to find and fetch linked databases by searching
async function fetchLinkedDatabase(type) {
  const searchTerms = {
    beings: "Beings & Entities",
    layers: "Layers & Realms",
    eras: "ERAs & Timeline",
  };

  const response = await notion.search({
    query: searchTerms[type],
    filter: { property: "object", value: "database" },
    page_size: 5,
  });

  for (const db of response.results) {
    if (db.object === "database") {
      const title = db.title?.map((t) => t.plain_text).join("") || "";
      if (title.includes(searchTerms[type].split(" ")[0])) {
        return await fetchDatabase(db.id);
      }
    }
  }

  return [];
}

module.exports = { fetchAllData, fetchDatabase };
