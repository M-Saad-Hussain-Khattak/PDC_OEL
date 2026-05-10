let currentPage = 1;
let currentCategory = "";
let currentTotal = 0;

const rowsPerPage = 10;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStars(rating) {
  const rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

async function performSearch(page = 1) {
  const input = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const query = input.value.trim() || "*:*";
  const sort = sortSelect.value;

  currentPage = page;

  const params = new URLSearchParams({
    q: query,
    page: String(page),
    sort,
  });

  if (currentCategory) {
    params.set("category", currentCategory);
  }

  const response = await fetch(`/search?${params.toString()}`);
  const data = await response.json();

  if (data.error) {
    document.getElementById("results").innerHTML =
      `<div class="empty-state">${escapeHtml(data.error)}</div>`;
    return;
  }

  currentTotal = data.response?.numFound || 0;
  renderResults(data.response?.docs || [], data.highlighting || {});
  renderFacets(data.facet_counts?.facet_fields || {});
  renderPagination(currentTotal, page);
}

function renderResults(docs, highlighting) {
  const container = document.getElementById("results");

  if (!docs.length) {
    container.innerHTML =
      '<div class="empty-state">No matching products found.</div>';
    document.getElementById("pageInfo").textContent = "";
    return;
  }

  container.innerHTML = `<p class="result-count">Showing ${docs.length} of ${currentTotal} products</p>`;

  docs.forEach((doc) => {
    const highlight = highlighting[doc.id] || {};
    const title = highlight.product_name?.[0] || doc.product_name;
    const description = highlight.description?.[0] || doc.description || "";

    container.innerHTML += `
      <article class="product-card">
        <div class="product-topline">
          <h3>${title}</h3>
          <span class="price">$${Number(doc.price).toFixed(2)}</span>
        </div>
        <div class="meta-row">
          <span class="chip">${escapeHtml(doc.category || "")}</span>
          <span class="chip muted-chip">${escapeHtml(doc.brand || "")}</span>
        </div>
        <div class="rating">${renderStars(doc.rating)} <span>${Number(doc.rating || 0).toFixed(1)}</span></div>
        <p class="description">${description}</p>
        <div class="stock ${doc.in_stock ? "in-stock" : "out-stock"}">${doc.in_stock ? "In stock" : "Out of stock"}</div>
      </article>`;
  });
}

function renderFacets(facetFields) {
  const container = document.getElementById("facets");
  const categoryFacet = facetFields.category || [];
  const brandFacet = facetFields.brand || [];

  const renderFacetList = (title, values, onClick) => {
    let html = `<div class="facet-group"><h3>${title}</h3><ul>`;
    for (let i = 0; i < values.length; i += 2) {
      const label = values[i];
      const count = values[i + 1];
      if (!label) continue;
      html += `<li><button type="button" class="facet-item" data-value="${escapeHtml(label)}">${escapeHtml(label)} <span>${count}</span></button></li>`;
    }
    html += "</ul></div>";
    return html;
  };

  container.innerHTML =
    renderFacetList("Category", categoryFacet) +
    renderFacetList("Brand", brandFacet);

  container.querySelectorAll(".facet-item").forEach((button) => {
    button.addEventListener("click", () => {
      currentCategory = button.dataset.value;
      document.getElementById("searchInput").value = "";
      performSearch(1);
    });
  });
}

function renderPagination(total, page) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  document.getElementById("pageInfo").textContent =
    `Page ${page} of ${totalPages}`;
  document.getElementById("prevPage").disabled = page <= 1;
  document.getElementById("nextPage").disabled = page >= totalPages;
}

async function autocomplete() {
  const input = document.getElementById("searchInput");
  const query = input.value.trim();
  const list = document.getElementById("autocomplete-list");

  if (query.length < 2) {
    list.innerHTML = "";
    return;
  }

  const response = await fetch(`/autocomplete?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  const suggestions = data.suggestions || [];

  list.innerHTML = suggestions
    .map(
      (item) =>
        `<button type="button" class="suggestion" data-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`,
    )
    .join("");

  list.querySelectorAll(".suggestion").forEach((button) => {
    button.addEventListener("click", () =>
      selectSuggestion(button.dataset.value),
    );
  });
}

function selectSuggestion(value) {
  document.getElementById("searchInput").value = value;
  document.getElementById("autocomplete-list").innerHTML = "";
  currentCategory = "";
  performSearch(1);
}

function clearFilters() {
  currentCategory = "";
  document.getElementById("searchInput").value = "";
  document.getElementById("autocomplete-list").innerHTML = "";
  performSearch(1);
}

document.getElementById("searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  currentCategory = "";
  performSearch(1);
});

document.getElementById("searchInput").addEventListener("input", autocomplete);
document
  .getElementById("prevPage")
  .addEventListener("click", () => performSearch(Math.max(1, currentPage - 1)));
document
  .getElementById("nextPage")
  .addEventListener("click", () => performSearch(currentPage + 1));
document
  .getElementById("clearFilterBtn")
  .addEventListener("click", clearFilters);

window.addEventListener("load", () => performSearch(1));
