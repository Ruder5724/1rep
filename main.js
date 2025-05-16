document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchQuery');
  const searchButton = document.getElementById('searchButton');
  const searchResults = document.getElementById('searchResults');
  const searchOptions = document.querySelectorAll('.search-option');
  const minGradeInput = document.getElementById('minGrade');
  const maxGradeInput = document.getElementById('maxGrade');
  const workPage = document.getElementById('workPage');
  const workTitle = document.getElementById('workTitle');
  const workAuthor = document.getElementById('workAuthor');
  const workType = document.getElementById('workType');
  const workGradeLevel = document.getElementById('workGradeLevel');
  const workYear = document.getElementById('workYear');
  const workGrade = document.getElementById('workGrade');
  const workSupervisor = document.getElementById('workSupervisor');
  const workContent = document.getElementById('workContent');
  const workDownload = document.getElementById('workDownload');
  const backToSearch = document.getElementById('backToSearch');
  const workPreview = document.getElementById('workPreview');
  const workFrame = document.getElementById('workFrame');
  const viewToggle = document.getElementById('viewToggle');

  let currentType = 'all';
  let searchTimeout = null;

  function setupListeners() {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(performSearch, 300);
    });

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') performSearch();
    });

    backToSearch.addEventListener('click', e => {
      e.preventDefault();
      workPage.style.display = 'none';
      searchResults.style.display = 'block';
    });

    viewToggle.addEventListener('click', togglePreview);

    searchOptions.forEach(option => {
      option.addEventListener('click', function () {
        searchOptions.forEach(o => o.classList.remove('active'));
        this.classList.add('active');
        currentType = this.dataset.type;
        performSearch();
      });
    });

    minGradeInput.addEventListener('input', performSearch);
    maxGradeInput.addEventListener('input', performSearch);
  }

  function performSearch() {
    // Это пример: предполагается, что worksDatabase загружается отдельно
    const query = searchInput.value.toLowerCase().trim();
    const minGrade = parseInt(minGradeInput.value) || 0;
    const maxGrade = parseInt(maxGradeInput.value) || 100;

    const results = worksDatabase.filter(work => {
      const matchesQuery =
        query === '' ||
        work.title.toLowerCase().includes(query) ||
        work.author.toLowerCase().includes(query);

      const matchesType =
        currentType === 'all' ||
        work.type === currentType ||
        (currentType === '8grade' && work.gradeLevel === '8') ||
        (currentType === '11grade' && work.gradeLevel === '11');

      const matchesGrade = work.grade >= minGrade && work.grade <= maxGrade;

      return matchesQuery && matchesType && matchesGrade;
    });

    displayResults(results);
  }

  function displayResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = `<div class="no-results">Работ по вашему запросу не найдено</div>`;
      return;
    }

    searchResults.innerHTML = results.map(work => `
      <div class="result-item" data-id="${work.id}">
        <div class="result-title">${work.title}</div>
        <div class="result-meta">${getTypeName(work.type)} | Класс: ${work.gradeLevel} | Автор: ${work.author} | Год: ${work.year} | Баллы: ${work.grade}/100 | Руководитель: ${work.supervisor}</div>
        <div class="result-snippet">${getSnippet(work.content)}</div>
      </div>
    `).join('');

    document.querySelectorAll('.result-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        showWorkPage(id);
      });
    });

    searchResults.style.display = 'block';
    workPage.style.display = 'none';
  }

  function showWorkPage(workId) {
    const work = worksDatabase.find(w => w.id === workId);
    if (!work) return;

    workTitle.textContent = work.title;
    workAuthor.textContent = work.author;
    workType.textContent = getTypeName(work.type);
    workGradeLevel.textContent = work.gradeLevel;
    workYear.textContent = work.year;
    workGrade.textContent = `${work.grade}/100`;
    workSupervisor.textContent = work.supervisor;
    workContent.textContent = work.content;
    workDownload.href = work.fileUrl;

    const fileId = extractFileId(work.fileUrl);
    if (fileId) {
      workFrame.src = `https://docs.google.com/viewer?embedded=true&url=https://drive.google.com/uc?id=${fileId}`;
    }

    workPreview.style.display = 'none';
    viewToggle.textContent = 'Просмотреть онлайн';
    workPage.style.display = 'block';
    searchResults.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function togglePreview() {
    const isHidden = workPreview.style.display === 'none';
    workPreview.style.display = isHidden ? 'block' : 'none';
    viewToggle.textContent = isHidden ? 'Скрыть просмотр' : 'Просмотреть онлайн';
  }

  function extractFileId(url) {
    const match = url.match(/(?:file|document)\/d\/([^\/]+)/);
    return match ? match[1] : null;
  }

  function getTypeName(type) {
    switch (type) {
      case 'research': return 'Исследовательская';
      case 'practical': return 'Практическая';
      default: return 'Неизвестный тип';
    }
  }

  function getSnippet(text) {
    return text.length > 150 ? text.slice(0, 147) + '...' : text;
  }

  setupListeners();
});
