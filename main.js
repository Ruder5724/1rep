document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const workId = urlParams.get('workId');
    if (workId) {
        showWorkPage(parseInt(workId));
    }
    setupEventListeners();
});

function setupEventListeners() {
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });

    backToSearch.addEventListener('click', function(e) {
        e.preventDefault();
        workPage.style.display = 'none';
        searchResults.style.display = 'block';
    });

    viewToggle.addEventListener('click', togglePreview);

    searchOptions.forEach(option => {
        option.addEventListener('click', function() {
            searchOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentType = this.dataset.type;
            performSearch();
        });
    });

    minGradeInput.addEventListener('input', performSearch);
    maxGradeInput.addEventListener('input', performSearch);
}

function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    const minGrade = parseInt(minGradeInput.value) || 0;
    const maxGrade = parseInt(maxGradeInput.value) || 100;

    let results = worksDatabase.filter(work => {
        const matchesQuery = query === '' || 
            work.title.toLowerCase().includes(query) || 
            work.author.toLowerCase().includes(query);

        const matchesType = 
            currentType === 'all' || 
            (currentType === 'research' && work.type === 'research') ||
            (currentType === 'practical' && work.type === 'practical') ||
            (currentType === '8grade' && work.gradeLevel === '8') ||
            (currentType === '11grade' && work.gradeLevel === '11');

        const matchesGrade = work.grade >= minGrade && work.grade <= maxGrade;

        return matchesQuery && matchesType && matchesGrade;
    });

    displayResults(results);
}

function displayResults(results) {
    searchResults.style.display = 'block';
    workPage.style.display = 'none';
    workPreview.style.display = 'none';
    viewToggle.textContent = 'Просмотреть онлайн';

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">Работ по вашему запросу не найдено</div>';
        return;
    }

    let html = '';
    results.forEach(work => {
        html += `
            <div class="result-item" data-id="${work.id}">
                <div class="result-title">${work.title}</div>
                <div class="result-meta">${getTypeName(work.type)} | Класс: ${work.gradeLevel} | Автор: ${work.author} | Год: ${work.year} | Баллы: ${work.grade}/100 | Руководитель: ${work.supervisor}</div>
                <div class="result-snippet">${getSnippet(work.content)}</div>
            </div>
        `;
    });

    searchResults.innerHTML = html;

    document.querySelectorAll('.result-item').forEach(item => {
        item.addEventListener('click', function() {
            const workId = parseInt(this.dataset.id);
            showWorkPage(workId);
        });
    });
}

function showWorkPage(workId) {
    const work = worksDatabase.find(w => w.id === workId);
    if (!work) return;

    workTitle.textContent = work.title;
    workAuthor.textContent = work.author;
    workType.textContent = getTypeName(work.type);
    workGradeLevel.textContent = work.gradeLevel;
    workYear.textContent = work.year;
    workGrade.textContent = work.grade + '/100';
    workSupervisor.textContent = work.supervisor;
    workContent.textContent = work.content;
    workDownload.href = work.fileUrl;

    const fileId = extractFileId(work.fileUrl);
    if (fileId) {
        const previewUrl = `https://docs.google.com/viewer?embedded=true&url=https://drive.google.com/uc?id=${fileId}`;
        workFrame.src = previewUrl;
    }

    searchResults.style.display = 'none';
    workPage.style.display = 'block';
    workPreview.style.display = 'none';
    viewToggle.textContent = 'Просмотреть онлайн';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState(null, '', `?workId=${workId}`);
}

function togglePreview() {
    if (workPreview.style.display === 'none') {
        workPreview.style.display = 'block';
        this.textContent = 'Скрыть просмотр';
    } else {
        workPreview.style.display = 'none';
        this.textContent = 'Просмотреть онлайн';
    }
}

function extractFileId(url) {
    if (!url) return null;
    const fileMatch = url.match(/\/file\/d\/([^\/]+)/);
    if (fileMatch) return fileMatch[1];
    const docMatch = url.match(/\/document\/d\/([^\/]+)/);
    if (docMatch) return docMatch[1];
    return null;
}

// Заглушки (эти функции и массив должны быть определены)
function getTypeName(type) {
    const map = {
        research: 'Исследовательская',
        practical: 'Практическая'
    };
    return map[type] || 'Неизвестно';
}

function getSnippet(text) {
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
}

// Пример массива работ (заглушка)
const worksDatabase = [
    {
        id: 1,
        title: "Пример работы",
        author: "Иван Иванов",
        type: "research",
        gradeLevel: "11",
        year: 2024,
        grade: 92,
        supervisor: "Петрова Н. А.",
        content: "Краткое содержание исследовательской работы...",
        fileUrl: "https://drive.google.com/file/d/1AbcDxyz123/view?usp=sharing"
    }
];
