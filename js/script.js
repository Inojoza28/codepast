        class CodeNest {
            constructor() {
                this.currentFolder = null;
                this.folders = this.loadFolders();
                this.initializeEventListeners();
                this.render();
            }

            loadFolders() {
                const saved = JSON.parse(localStorage.getItem("codenest-folders") || "{}");
                return saved;
            }

            saveFolders() {
                localStorage.setItem("codenest-folders", JSON.stringify(this.folders));
            }

            initializeEventListeners() {
                // Create folder
                document.getElementById("createFirstFolder").addEventListener("click", () => {
                    this.showCreateFolderModal();
                });
                document.getElementById("createFirstFolderBottom").addEventListener("click", () => {
                    this.showCreateFolderModal();
                });
                document.getElementById("createFolderBtn").addEventListener("click", () => {
                    this.showCreateFolderModal();
                });
                document.getElementById("confirmCreateFolder").addEventListener("click", () => {
                    this.createFolder();
                });
                document.getElementById("cancelCreateFolder").addEventListener("click", () => {
                    this.hideCreateFolderModal();
                });

                // Create snippet
                document.getElementById("addSnippetBtn").addEventListener("click", () => {
                    this.showCreateSnippetModal();
                });
                document.getElementById("confirmCreateSnippet").addEventListener("click", () => {
                    this.createSnippet();
                });
                document.getElementById("cancelCreateSnippet").addEventListener("click", () => {
                    this.hideCreateSnippetModal();
                });

                // View snippet
                document.getElementById("closeViewSnippet").addEventListener("click", () => {
                    this.hideViewSnippetModal();
                });
                document.getElementById("copyFullSnippet").addEventListener("click", () => {
                    this.copyFullSnippet();
                });

                // Navigation
                document.getElementById("backToFolders").addEventListener("click", () => {
                    this.showFoldersView();
                });

                // Search
                document.getElementById("searchInput").addEventListener("input", (e) => {
                    this.searchSnippets(e.target.value);
                });

                // Rename folder
                document.getElementById("renameFolderBtn").addEventListener("click", () => {
                    this.renameCurrentFolder();
                });

                // Delete folder
                document.getElementById("deleteFolderBtn").addEventListener("click", () => {
                    this.deleteCurrentFolder();
                });

                // Close modals on outside click
                document.getElementById("createFolderModal").addEventListener("click", (e) => {
                    if (e.target === e.currentTarget) this.hideCreateFolderModal();
                });
                document.getElementById("createSnippetModal").addEventListener("click", (e) => {
                    if (e.target === e.currentTarget) this.hideCreateSnippetModal();
                });
                document.getElementById("viewSnippetModal").addEventListener("click", (e) => {
                    if (e.target === e.currentTarget) this.hideViewSnippetModal();
                });

                // Enter key handling
                document.getElementById("folderNameInput").addEventListener("keypress", (e) => {
                    if (e.key === "Enter") this.createFolder();
                });

                // Escape key handling
                document.addEventListener("keydown", (e) => {
                    if (e.key === "Escape") {
                        this.hideCreateFolderModal();
                        this.hideCreateSnippetModal();
                        this.hideViewSnippetModal();
                    }
                });
            }

            render() {
                const hasfolders = Object.keys(this.folders).length > 0;
                
                document.getElementById("welcomeSection").classList.toggle("hidden", hasfolders);
                document.getElementById("foldersSection").classList.toggle("hidden", !hasfolders);
                
                if (hasfolders) {
                    this.renderFolders();
                }
            }

            renderFolders() {
                const grid = document.getElementById("foldersGrid");
                grid.innerHTML = "";

                Object.entries(this.folders).forEach(([id, folder]) => {
                    const snippetCount = Object.keys(folder.snippets || {}).length;
                    const folderCard = document.createElement("div");
                    folderCard.className = "folder-card bg-white p-4 sm:p-6 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300";
                    folderCard.innerHTML = `
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"></path>
                                </svg>
                            </div>
                            <span class="text-xs sm:text-sm text-gray-500">${snippetCount} snippets</span>
                        </div>
                        <h3 class="text-base sm:text-lg font-semibold text-gray-900 truncate">${folder.name}</h3>
                        <p class="text-xs sm:text-sm text-gray-600">Criado em ${new Date(folder.createdAt).toLocaleDateString("pt-BR")}</p>
                    `;
                    folderCard.addEventListener("click", () => this.openFolder(id));
                    grid.appendChild(folderCard);
                });
            }

            showCreateFolderModal() {
                document.getElementById("createFolderModal").classList.remove("hidden");
                document.getElementById("folderNameInput").focus();
            }

            hideCreateFolderModal() {
                document.getElementById("createFolderModal").classList.add("hidden");
                document.getElementById("folderNameInput").value = "";
            }

            createFolder() {
                const name = document.getElementById("folderNameInput").value.trim();
                if (!name) return;

                const id = Date.now().toString();
                this.folders[id] = {
                    name,
                    createdAt: new Date().toISOString(),
                    snippets: {}
                };

                this.saveFolders();
                this.hideCreateFolderModal();
                this.render();
            }

            openFolder(folderId) {
                this.currentFolder = folderId;
                const folder = this.folders[folderId];
                
                document.getElementById("folderTitle").textContent = folder.name;
                document.getElementById("foldersSection").classList.add("hidden");
                document.getElementById("folderView").classList.remove("hidden");
                
                this.renderSnippets();
            }

            showFoldersView() {
                this.currentFolder = null;
                document.getElementById("folderView").classList.add("hidden");
                document.getElementById("foldersSection").classList.remove("hidden");
            }

            renderSnippets() {
                const grid = document.getElementById("snippetsGrid");
                grid.innerHTML = "";

                const folder = this.folders[this.currentFolder];
                const snippets = folder.snippets || {};

                if (Object.keys(snippets).length === 0) {
                    grid.innerHTML = `
                        <div class="text-center py-12">
                            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum snippet ainda</h3>
                            <p class="text-gray-600 mb-4">Adicione seu primeiro snippet de código nesta pasta.</p>
                            <button onclick="app.showCreateSnippetModal()" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                Criar Primeiro Snippet
                            </button>
                        </div>
                    `;
                    return;
                }

                Object.entries(snippets).forEach(([id, snippet]) => {
                    const snippetCard = document.createElement("div");
                    snippetCard.className = "snippet-card bg-white p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-gray-300";
                    
                    const previewCode = snippet.code.length > 200 ? 
                        snippet.code.substring(0, 200) + "..." : 
                        snippet.code;

                    snippetCard.innerHTML = `
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                            <div class="flex-1 min-w-0">
                                <h3 class="text-base sm:text-lg font-semibold text-gray-900 truncate">${snippet.title}</h3>
                                <div class="flex items-center space-x-2 mt-1">
                                    <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${snippet.language}</span>
                                    <span class="text-xs text-gray-500">${new Date(snippet.createdAt).toLocaleDateString("pt-BR")}</span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button onclick="app.copySnippet('${id}')" class="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                </button>
                                <button onclick="app.deleteSnippet('${id}')" class="text-red-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="code-preview cursor-pointer" onclick="app.viewFullSnippet('${id}')">
                            <pre class="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto border border-gray-700"><code class="language-${snippet.language} text-sm">${this.escapeHtml(previewCode)}</code></pre>
                        </div>
                    `;
                    
                    grid.appendChild(snippetCard);
                });

                // Highlight code after rendering
                setTimeout(() => Prism.highlightAll(), 100);
            }

            showCreateSnippetModal() {
                document.getElementById("createSnippetModal").classList.remove("hidden");
                document.getElementById("snippetTitleInput").focus();
            }

            hideCreateSnippetModal() {
                document.getElementById("createSnippetModal").classList.add("hidden");
                document.getElementById("snippetTitleInput").value = "";
                document.getElementById("snippetCodeInput").value = "";
                document.getElementById("snippetLanguage").value = "javascript";
            }

            createSnippet() {
                const title = document.getElementById("snippetTitleInput").value.trim();
                const code = document.getElementById("snippetCodeInput").value.trim();
                const language = document.getElementById("snippetLanguage").value;

                if (!title || !code) return;

                const id = Date.now().toString();
                const folder = this.folders[this.currentFolder];
                
                if (!folder.snippets) folder.snippets = {};
                
                folder.snippets[id] = {
                    title,
                    code,
                    language,
                    createdAt: new Date().toISOString()
                };

                this.saveFolders();
                this.hideCreateSnippetModal();
                this.renderSnippets();
            }

            viewFullSnippet(snippetId) {
                const snippet = this.folders[this.currentFolder].snippets[snippetId];
                
                document.getElementById("viewSnippetTitle").textContent = snippet.title;
                document.getElementById("viewSnippetLanguage").textContent = snippet.language;
                document.getElementById("viewSnippetDate").textContent = new Date(snippet.createdAt).toLocaleDateString("pt-BR");
                
                const codeElement = document.getElementById("viewSnippetCode");
                codeElement.textContent = snippet.code;
                codeElement.className = `language-${snippet.language} text-sm`;
                
                document.getElementById("viewSnippetModal").classList.remove("hidden");
                
                // Highlight code
                setTimeout(() => Prism.highlightAll(), 100);
            }

            hideViewSnippetModal() {
                document.getElementById("viewSnippetModal").classList.add("hidden");
            }

            copySnippet(snippetId) {
                const snippet = this.folders[this.currentFolder].snippets[snippetId];
                navigator.clipboard.writeText(snippet.code).then(() => {
                    this.showToast("Código copiado!");
                });
            }

            copyFullSnippet() {
                const codeElement = document.getElementById("viewSnippetCode");
                navigator.clipboard.writeText(codeElement.textContent).then(() => {
                    this.showToast("Código copiado!");
                });
            }

            deleteSnippet(snippetId) {
                if (confirm("Tem certeza que deseja excluir este snippet?")) {
                    delete this.folders[this.currentFolder].snippets[snippetId];
                    this.saveFolders();
                    this.renderSnippets();
                }
            }

            renameCurrentFolder() {
                const folder = this.folders[this.currentFolder];
                const newName = prompt("Novo nome da pasta:", folder.name);
                
                if (newName && newName.trim() && newName.trim() !== folder.name) {
                    folder.name = newName.trim();
                    this.saveFolders();
                    document.getElementById("folderTitle").textContent = folder.name;
                }
            }

            deleteCurrentFolder() {
                const folder = this.folders[this.currentFolder];
                const snippetCount = Object.keys(folder.snippets || {}).length;
                
                let message = "Tem certeza que deseja excluir esta pasta?";
                if (snippetCount > 0) {
                    message += ` Ela contém ${snippetCount} snippet(s) que também serão excluídos.`;
                }
                
                if (confirm(message)) {
                    delete this.folders[this.currentFolder];
                    this.saveFolders();
                    this.showFoldersView();
                    this.render();
                }
            }

            searchSnippets(query) {
                if (!query.trim()) {
                    this.renderSnippets();
                    return;
                }

                const grid = document.getElementById("snippetsGrid");
                grid.innerHTML = "";

                const folder = this.folders[this.currentFolder];
                const snippets = folder.snippets || {};
                const filteredSnippets = {};

                Object.entries(snippets).forEach(([id, snippet]) => {
                    if (snippet.title.toLowerCase().includes(query.toLowerCase()) ||
                        snippet.code.toLowerCase().includes(query.toLowerCase()) ||
                        snippet.language.toLowerCase().includes(query.toLowerCase())) {
                        filteredSnippets[id] = snippet;
                    }
                });

                if (Object.keys(filteredSnippets).length === 0) {
                    grid.innerHTML = `
                        <div class="text-center py-12">
                            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                            <p class="text-gray-600">Tente usar palavras-chave diferentes.</p>
                        </div>
                    `;
                    return;
                }

                Object.entries(filteredSnippets).forEach(([id, snippet]) => {
                    const snippetCard = document.createElement("div");
                    snippetCard.className = "snippet-card bg-white p-4 sm:p-6 rounded-lg border border-gray-200 hover:border-gray-300";
                    
                    const previewCode = snippet.code.length > 200 ? 
                        snippet.code.substring(0, 200) + "..." : 
                        snippet.code;

                    snippetCard.innerHTML = `
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                            <div class="flex-1 min-w-0">
                                <h3 class="text-base sm:text-lg font-semibold text-gray-900 truncate">${snippet.title}</h3>
                                <div class="flex items-center space-x-2 mt-1">
                                    <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${snippet.language}</span>
                                    <span class="text-xs text-gray-500">${new Date(snippet.createdAt).toLocaleDateString("pt-BR")}</span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button onclick="app.copySnippet('${id}')" class="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                </button>
                                <button onclick="app.deleteSnippet('${id}')" class="text-red-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="code-preview cursor-pointer" onclick="app.viewFullSnippet('${id}')">
                            <pre class="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto border border-gray-700"><code class="language-${snippet.language} text-sm">${this.escapeHtml(previewCode)}</code></pre>
                        </div>
                    `;
                    
                    grid.appendChild(snippetCard);
                });

                // Highlight code after rendering
                setTimeout(() => Prism.highlightAll(), 100);
            }

            showToast(message) {
                const toast = document.getElementById("toast");
                const toastMessage = document.getElementById("toastMessage");
                
                toastMessage.textContent = message;
                toast.classList.remove("hidden");
                toast.classList.add("show");
                
                setTimeout(() => {
                    toast.classList.remove("show");
                    setTimeout(() => {
                        toast.classList.add("hidden");
                    }, 300);
                }, 2000);
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }

        // Initialize the app
        const app = new CodeNest();