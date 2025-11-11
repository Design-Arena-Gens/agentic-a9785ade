const ACCESS_PASSWORD = "dogtraining2024!";

const STORAGE_KEYS = {
  clients: "adalberto_clients",
  media: "adalberto_media",
  receipts: "adalberto_receipts",
  notifications: "adalberto_notifications",
};

const elements = {
  loginOverlay: document.getElementById("loginOverlay"),
  loginForm: document.getElementById("loginForm"),
  mediaGrid: document.getElementById("mediaGrid"),
  mediaDialog: document.getElementById("mediaDialog"),
  mediaForm: document.getElementById("mediaForm"),
  mediaClient: document.getElementById("mediaClient"),
  mediaClientFilter: document.getElementById("mediaClientFilter"),
  refreshMedia: document.getElementById("refreshMedia"),
  openMediaUpload: document.getElementById("openMediaUpload"),
  clientDialog: document.getElementById("clientDialog"),
  clientForm: document.getElementById("clientForm"),
  clientList: document.getElementById("clientList"),
  openClientModal: document.getElementById("openClientModal"),
  addClientInline: document.getElementById("addClientInline"),
  receiptDialog: document.getElementById("receiptDialog"),
  receiptForm: document.getElementById("receiptForm"),
  receiptList: document.getElementById("receiptList"),
  createReceiptButton: document.getElementById("createReceiptButton"),
  notificationDialog: document.getElementById("notificationDialog"),
  notificationForm: document.getElementById("notificationForm"),
  notificationList: document.getElementById("notificationList"),
  openNotificationModal: document.getElementById("openNotificationModal"),
  notificationAudience: document.getElementById("notificationAudience"),
  toast: document.getElementById("toast"),
};

let state = {
  clients: [],
  media: [],
  receipts: [],
  notifications: [],
};

document.querySelectorAll(".close-modal").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = button.closest("dialog");
    if (dialog) dialog.close();
  });
});

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: value.length > 10 ? "short" : undefined,
  }).format(new Date(value));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  setTimeout(() => elements.toast.classList.remove("visible"), 2500);
}

function loadFromStorage(key, fallback) {
  try {
    const payload = localStorage.getItem(key);
    if (!payload) return fallback;
    return JSON.parse(payload);
  } catch (error) {
    console.error("Erro ao carregar", key, error);
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureInitialData() {
  const seeded = loadFromStorage("adalberto_seeded", false);
  if (!seeded) {
    const demoClients = [
      {
        id: uid(),
        name: "Fernanda Lima",
        dogName: "Thor",
        breed: "Golden Retriever",
        trainingPlan: "Obediência Avançada",
        email: "fernanda.lima@email.com",
        phone: "(11) 90000-1234",
        notes: "Thor responde bem a comandos com petiscos.",
      },
      {
        id: uid(),
        name: "Ricardo Souza",
        dogName: "Lua",
        breed: "Border Collie",
        trainingPlan: "Agility Performance",
        email: "ricardo.souza@email.com",
        phone: "(11) 98888-4321",
        notes: "Preparação para competição agility em setembro.",
      },
    ];

    const demoMedia = [
      {
        id: uid(),
        title: "Thor - Sessão de obediência",
        clientId: demoClients[0].id,
        type: "image",
        dataUrl:
          "https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=900&q=80",
        uploadedAt: new Date().toISOString(),
        fileName: "treino-thor.jpg",
      },
      {
        id: uid(),
        title: "Lua - Treino de agility",
        clientId: demoClients[1].id,
        type: "image",
        dataUrl:
          "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?auto=format&fit=crop&w=900&q=80",
        uploadedAt: new Date().toISOString(),
        fileName: "agility-lua.jpg",
      },
    ];

    const demoReceipts = [
      {
        id: uid(),
        clientId: demoClients[0].id,
        amount: "250.00",
        service: "Sessão individual - Obediência",
        paymentMethod: "Pix",
        date: new Date().toISOString().slice(0, 10),
        notes: "Sessão realizada em domicílio.",
        reference: `DT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      },
    ];

    const demoNotifications = [
      {
        id: uid(),
        title: "Plano de treino disponível",
        message:
          "Thor tem novo conteúdo disponível na galeria com exercícios para reforço de comandos.",
        audience: demoClients[0].id,
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: uid(),
        title: "Sessão confirmada",
        message: "Próximo encontro com Lua confirmado para sábado, 10h.",
        audience: "all",
        createdAt: new Date().toISOString(),
        read: true,
      },
    ];

    saveToStorage(STORAGE_KEYS.clients, demoClients);
    saveToStorage(STORAGE_KEYS.media, demoMedia);
    saveToStorage(STORAGE_KEYS.receipts, demoReceipts);
    saveToStorage(STORAGE_KEYS.notifications, demoNotifications);
    localStorage.setItem("adalberto_seeded", JSON.stringify(true));
  }
}

function hydrateState() {
  ensureInitialData();
  state.clients = loadFromStorage(STORAGE_KEYS.clients, []);
  state.media = loadFromStorage(STORAGE_KEYS.media, []);
  state.receipts = loadFromStorage(STORAGE_KEYS.receipts, []);
  state.notifications = loadFromStorage(STORAGE_KEYS.notifications, []);
}

function syncStorage() {
  saveToStorage(STORAGE_KEYS.clients, state.clients);
  saveToStorage(STORAGE_KEYS.media, state.media);
  saveToStorage(STORAGE_KEYS.receipts, state.receipts);
  saveToStorage(STORAGE_KEYS.notifications, state.notifications);
}

function updateClientOptions() {
  const selects = [
    elements.mediaClient,
    elements.mediaClientFilter,
    document.getElementById("receiptClient"),
    elements.notificationAudience,
  ];

  selects.forEach((select) => {
    if (!select) return;
    const currentValue = select.value;
    const isFilter = select === elements.mediaClientFilter || select === elements.notificationAudience;
    select.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "all";
    defaultOption.textContent =
      select === elements.mediaClient ? "Compartilhar com todos" : "Todos os clientes";
    if (select === document.getElementById("receiptClient")) {
      defaultOption.disabled = true;
      defaultOption.textContent = "Selecione um cliente";
    }
    if (!(select === document.getElementById("receiptClient"))) {
      select.appendChild(defaultOption);
    } else {
      select.appendChild(defaultOption);
    }

    state.clients.forEach((client) => {
      const option = document.createElement("option");
      option.value = client.id;
      option.textContent = `${client.name} · ${client.dogName}`;
      select.appendChild(option);
    });

    if (select === document.getElementById("receiptClient")) {
      select.value = currentValue && currentValue !== "all" ? currentValue : "";
    } else if (isFilter) {
      select.value = currentValue || "all";
    } else {
      select.value = "all";
    }
  });
}

function renderClients() {
  const list = elements.clientList;
  list.innerHTML = "";

  if (!state.clients.length) {
    const empty = document.createElement("p");
    empty.className = "panel-hint";
    empty.textContent =
      "Nenhum cliente cadastrado. Cadastre para organizar planos, comprovantes e notificações.";
    list.appendChild(empty);
    return;
  }

  state.clients.forEach((client) => {
    const card = document.createElement("article");
    card.className = "client-card";
    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent = `${client.name}`;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = client.dogName ? `Tutor de ${client.dogName}` : "Cliente";
    header.appendChild(title);
    header.appendChild(chip);

    const details = document.createElement("div");
    details.className = "client-details";
    details.innerHTML = `
      <strong>Plano:</strong> ${client.trainingPlan || "Não informado"}<br />
      <strong>Raça:</strong> ${client.breed || "-"}<br />
      <strong>Contato:</strong> ${client.email || "-"}${client.phone ? " · " + client.phone : ""}<br />
      <strong>Anotações:</strong> ${client.notes || "-"}
    `;

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => openClientModal(client));
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remover";
    removeButton.addEventListener("click", () => removeClient(client.id));
    actions.appendChild(editButton);
    actions.appendChild(removeButton);

    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(actions);

    list.appendChild(card);
  });
}

function renderMedia() {
  const filterClient = elements.mediaClientFilter.value;
  const items =
    filterClient === "all"
      ? state.media
      : state.media.filter((media) => media.clientId === filterClient);

  elements.mediaGrid.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "panel-hint";
    empty.textContent =
      "Envie fotos e vídeos para compartilhar com seus clientes. Eles ficarão disponíveis imediatamente.";
    elements.mediaGrid.appendChild(empty);
    return;
  }

  items
    .slice()
    .reverse()
    .forEach((item) => {
      const card = document.createElement("article");
      card.className = "media-card";
      const thumb = document.createElement("div");
      thumb.className = "media-thumb";
      if (item.type.startsWith("video")) {
        const video = document.createElement("video");
        video.src = item.dataUrl;
        video.controls = true;
        thumb.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = item.dataUrl;
        img.alt = item.title || item.fileName;
        thumb.appendChild(img);
      }

      const content = document.createElement("div");
      content.className = "media-content";
      const title = document.createElement("h3");
      title.textContent = item.title || item.fileName;
      const meta = document.createElement("div");
      meta.className = "media-meta";
      const targetClient =
        item.clientId === "all"
          ? "Todos"
          : state.clients.find((client) => client.id === item.clientId)?.name || "Cliente removido";
      meta.innerHTML = `<span>${formatDate(item.uploadedAt)}</span><span class="tag">${targetClient}</span>`;

      const actions = document.createElement("div");
      actions.className = "media-actions";
      const viewButton = document.createElement("button");
      viewButton.textContent = "Visualizar";
      viewButton.addEventListener("click", () => openMedia(item));
      const copyButton = document.createElement("button");
      copyButton.textContent = "Copiar link";
      copyButton.addEventListener("click", () => copyMediaLink(item));
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Remover";
      deleteButton.addEventListener("click", () => removeMedia(item.id));
      actions.appendChild(viewButton);
      actions.appendChild(copyButton);
      actions.appendChild(deleteButton);

      content.appendChild(title);
      content.appendChild(meta);
      content.appendChild(actions);

      card.appendChild(thumb);
      card.appendChild(content);
      elements.mediaGrid.appendChild(card);
    });
}

function renderReceipts() {
  elements.receiptList.innerHTML = "";

  if (!state.receipts.length) {
    const empty = document.createElement("p");
    empty.className = "panel-hint";
    empty.textContent =
      "Crie um novo comprovante para gerar recibos rápidos e enviar aos clientes.";
    elements.receiptList.appendChild(empty);
    return;
  }

  state.receipts
    .slice()
    .reverse()
    .forEach((receipt) => {
      const card = document.createElement("article");
      card.className = "receipt-card";
      const header = document.createElement("header");
      const title = document.createElement("h3");
      const client = state.clients.find((client) => client.id === receipt.clientId);
      title.textContent = client ? `${client.name}` : "Cliente removido";
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = `Ref. ${receipt.reference}`;
      header.appendChild(title);
      header.appendChild(badge);

      const data = document.createElement("div");
      data.className = "receipt-data";
      data.innerHTML = `
        <span><strong>Valor:</strong> ${formatCurrency(receipt.amount)}</span>
        <span><strong>Serviço:</strong> ${receipt.service || "-"}</span>
        <span><strong>Data:</strong> ${formatDate(receipt.date)}</span>
        <span><strong>Pagamento:</strong> ${receipt.paymentMethod || "-"}</span>
        <span style="grid-column: 1 / -1;"><strong>Observações:</strong> ${receipt.notes || "-"}</span>
      `;

      const actions = document.createElement("div");
      actions.className = "card-actions";
      const viewButton = document.createElement("button");
      viewButton.textContent = "Visualizar";
      viewButton.addEventListener("click", () => openReceipt(receipt));
      const shareButton = document.createElement("button");
      shareButton.textContent = "Copiar resumo";
      shareButton.addEventListener("click", () => copyReceipt(receipt, client));
      const removeButton = document.createElement("button");
      removeButton.textContent = "Remover";
      removeButton.addEventListener("click", () => removeReceipt(receipt.id));
      actions.appendChild(viewButton);
      actions.appendChild(shareButton);
      actions.appendChild(removeButton);

      card.appendChild(header);
      card.appendChild(data);
      card.appendChild(actions);

      elements.receiptList.appendChild(card);
    });
}

function renderNotifications() {
  elements.notificationList.innerHTML = "";

  if (!state.notifications.length) {
    const empty = document.createElement("p");
    empty.className = "panel-hint";
    empty.textContent =
      "Envie lembretes e atualizações para clientes com poucos cliques. Eles aparecem aqui.";
    elements.notificationList.appendChild(empty);
    return;
  }

  state.notifications
    .slice()
    .reverse()
    .forEach((notification) => {
      const card = document.createElement("article");
      card.className = "notification-card";
      if (!notification.read) card.classList.add("unread");

      const header = document.createElement("header");
      const title = document.createElement("h3");
      title.textContent = notification.title;
      const badge = document.createElement("span");
      badge.className = "badge";
      const target =
        notification.audience === "all"
          ? "Todos os clientes"
          : state.clients.find((client) => client.id === notification.audience)?.name ||
            "Cliente removido";
      badge.textContent = target;
      header.appendChild(title);
      header.appendChild(badge);

      const message = document.createElement("p");
      message.textContent = notification.message;
      message.style.margin = "0";
      message.style.color = "var(--text-secondary)";

      const footer = document.createElement("div");
      footer.className = "card-actions";
      const markButton = document.createElement("button");
      markButton.textContent = notification.read ? "Marcar como novo" : "Marcar como lido";
      markButton.addEventListener("click", () => toggleNotification(notification.id));
      const removeButton = document.createElement("button");
      removeButton.textContent = "Remover";
      removeButton.addEventListener("click", () => removeNotification(notification.id));
      footer.appendChild(markButton);
      footer.appendChild(removeButton);

      const time = document.createElement("span");
      time.style.fontSize = "0.75rem";
      time.style.color = "var(--text-secondary)";
      time.textContent = `Enviado em ${formatDate(notification.createdAt)}`;

      card.appendChild(header);
      card.appendChild(message);
      card.appendChild(time);
      card.appendChild(footer);

      elements.notificationList.appendChild(card);
    });
}

function openClientModal(client) {
  if (client) {
    elements.clientForm.querySelector("#clientId").value = client.id;
    elements.clientForm.querySelector("#clientName").value = client.name;
    elements.clientForm.querySelector("#dogName").value = client.dogName || "";
    elements.clientForm.querySelector("#breed").value = client.breed || "";
    elements.clientForm.querySelector("#trainingPlan").value = client.trainingPlan || "";
    elements.clientForm.querySelector("#clientEmail").value = client.email || "";
    elements.clientForm.querySelector("#clientPhone").value = client.phone || "";
    elements.clientForm.querySelector("#clientNotes").value = client.notes || "";
  } else {
    elements.clientForm.reset();
    elements.clientForm.querySelector("#clientId").value = "";
  }
  elements.clientDialog.showModal();
}

function removeClient(clientId) {
  if (!confirm("Remover cliente? Isso também removerá mídia, comprovantes e notificações associadas.")) {
    return;
  }
  state.clients = state.clients.filter((client) => client.id !== clientId);
  state.media = state.media.filter((media) => media.clientId !== clientId);
  state.receipts = state.receipts.filter((receipt) => receipt.clientId !== clientId);
  state.notifications = state.notifications.filter(
    (notification) => notification.audience !== clientId
  );
  syncStorage();
  updateClientOptions();
  renderClients();
  renderMedia();
  renderReceipts();
  renderNotifications();
  showToast("Cliente removido.");
}

function openMedia(item) {
  const preview = window.open("", "_blank");
  if (!preview) return;
  preview.document.write(`
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${item.title || item.fileName}</title>
        <style>
          body { margin:0; background:#05070f; display:grid; place-items:center; height:100vh; }
          img, video { max-width:90vw; max-height:90vh; border-radius:20px; }
          h1 { position:fixed; top:32px; left:50%; transform:translateX(-50%); color:#fff; font-family:sans-serif;}
        </style>
      </head>
      <body>
        <h1>${item.title || item.fileName}</h1>
        ${
          item.type.startsWith("video")
            ? `<video src="${item.dataUrl}" controls autoplay></video>`
            : `<img src="${item.dataUrl}" alt="${item.title || item.fileName}" />`
        }
      </body>
    </html>
  `);
  preview.document.close();
}

async function copyMediaLink(item) {
  try {
    await navigator.clipboard.writeText(item.dataUrl);
    showToast("Link copiado para a área de transferência.");
  } catch (error) {
    console.error(error);
    showToast("Não foi possível copiar. Abra a mídia e copie manualmente.");
  }
}

function removeMedia(mediaId) {
  if (!confirm("Remover esta mídia compartilhada?")) return;
  state.media = state.media.filter((media) => media.id !== mediaId);
  saveToStorage(STORAGE_KEYS.media, state.media);
  renderMedia();
  showToast("Mídia removida.");
}

function openReceipt(receipt) {
  const client = state.clients.find((client) => client.id === receipt.clientId);
  const win = window.open("", "_blank");
  if (!win) return;
  const today = new Date();
  win.document.write(`
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Comprovante - ${client ? client.name : "Cliente"}</title>
        <style>
          body { font-family: 'Montserrat', sans-serif; background: #0b0f1b; color: #fff; padding: 40px;}
          .card { max-width: 520px; margin: 0 auto; background: linear-gradient(140deg, rgba(47,128,255,0.2), rgba(255,122,41,0.12)); border-radius: 24px; padding: 32px; }
          h1 { margin-top: 0; }
          .row { margin-bottom: 12px; }
          strong { color: #ffb17a; }
          .footer { margin-top: 32px; font-size: 0.85rem; color: rgba(255,255,255,0.65); }
          .badge { display:inline-flex; padding:6px 12px; border-radius:999px; background:rgba(47,128,255,0.35); margin-bottom:16px; font-weight:600; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">Comprovante nº ${receipt.reference}</span>
          <h1>Adalberto Alves</h1>
          <p class="row"><strong>Cliente:</strong> ${client ? client.name : "Cliente removido"}</p>
          <p class="row"><strong>Serviço:</strong> ${receipt.service || "-"}</p>
          <p class="row"><strong>Valor:</strong> ${formatCurrency(receipt.amount)}</p>
          <p class="row"><strong>Forma de pagamento:</strong> ${receipt.paymentMethod || "-"}</p>
          <p class="row"><strong>Data do pagamento:</strong> ${formatDate(receipt.date)}</p>
          <p class="row"><strong>Anotações:</strong> ${receipt.notes || "-"}</p>
          <div class="footer">
            Gerado em ${today.toLocaleDateString("pt-BR")} às ${today.toLocaleTimeString("pt-BR")}.
            <br/>Personal Dog Training · contato@personaltrainercanino.com
          </div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `);
  win.document.close();
}

async function copyReceipt(receipt, client) {
  const summary = `
Comprovante ${receipt.reference}
Cliente: ${client ? client.name : "Cliente removido"}
Serviço: ${receipt.service || "-"}
Valor: ${formatCurrency(receipt.amount)}
Data pagamento: ${formatDate(receipt.date)}
Forma pagamento: ${receipt.paymentMethod || "-"}
Observações: ${receipt.notes || "-"}
  `;
  try {
    await navigator.clipboard.writeText(summary.trim());
    showToast("Resumo do comprovante copiado.");
  } catch (error) {
    console.error(error);
    showToast("Não foi possível copiar o comprovante.");
  }
}

function removeReceipt(receiptId) {
  if (!confirm("Remover este comprovante?")) return;
  state.receipts = state.receipts.filter((receipt) => receipt.id !== receiptId);
  saveToStorage(STORAGE_KEYS.receipts, state.receipts);
  renderReceipts();
  showToast("Comprovante removido.");
}

function toggleNotification(notificationId) {
  const notification = state.notifications.find((item) => item.id === notificationId);
  if (!notification) return;
  notification.read = !notification.read;
  saveToStorage(STORAGE_KEYS.notifications, state.notifications);
  renderNotifications();
}

function removeNotification(notificationId) {
  state.notifications = state.notifications.filter((notification) => notification.id !== notificationId);
  saveToStorage(STORAGE_KEYS.notifications, state.notifications);
  renderNotifications();
  showToast("Notificação removida.");
}

elements.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = document.getElementById("loginPassword").value;
  if (password.trim() === ACCESS_PASSWORD) {
    sessionStorage.setItem("adalberto_session", "active");
    elements.loginOverlay.classList.add("hidden");
    showToast("Bem-vindo ao painel, Adalberto!");
  } else {
    showToast("Senha incorreta. Verifique com Adalberto.");
  }
});

function checkSession() {
  if (sessionStorage.getItem("adalberto_session") === "active") {
    elements.loginOverlay.classList.add("hidden");
  }
}

elements.openMediaUpload.addEventListener("click", () => {
  elements.mediaForm.reset();
  elements.mediaDialog.showModal();
});

elements.mediaForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fileInput = document.getElementById("mediaFile");
  const titleInput = document.getElementById("mediaTitle");
  const clientSelect = document.getElementById("mediaClient");

  const file = fileInput.files[0];
  if (!file) {
    showToast("Selecione um arquivo para enviar.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const mediaItem = {
      id: uid(),
      title: titleInput.value.trim() || file.name,
      clientId: clientSelect.value || "all",
      type: file.type,
      dataUrl: reader.result,
      uploadedAt: new Date().toISOString(),
      fileName: file.name,
    };
    state.media.push(mediaItem);
    saveToStorage(STORAGE_KEYS.media, state.media);
    elements.mediaDialog.close();
    renderMedia();
    showToast("Arquivo compartilhado com sucesso!");
    elements.mediaForm.reset();
  };
  reader.onerror = () => showToast("Erro ao carregar arquivo.");
  reader.readAsDataURL(file);
});

elements.mediaClientFilter.addEventListener("change", () => renderMedia());
elements.refreshMedia.addEventListener("click", () => renderMedia());

function handleClientForm(event) {
  event.preventDefault();
  const id = document.getElementById("clientId").value;
  const payload = {
    id: id || uid(),
    name: document.getElementById("clientName").value.trim(),
    dogName: document.getElementById("dogName").value.trim(),
    breed: document.getElementById("breed").value.trim(),
    trainingPlan: document.getElementById("trainingPlan").value.trim(),
    email: document.getElementById("clientEmail").value.trim(),
    phone: document.getElementById("clientPhone").value.trim(),
    notes: document.getElementById("clientNotes").value.trim(),
  };

  if (!payload.name || !payload.dogName) {
    showToast("Preencha nome do cliente e do cão.");
    return;
  }

  if (id) {
    state.clients = state.clients.map((client) => (client.id === id ? payload : client));
    showToast("Cliente atualizado.");
  } else {
    state.clients.push(payload);
    showToast("Cliente cadastrado.");
  }
  saveToStorage(STORAGE_KEYS.clients, state.clients);
  elements.clientDialog.close();
  renderClients();
  updateClientOptions();
  elements.clientForm.reset();
}

elements.clientForm.addEventListener("submit", handleClientForm);
elements.openClientModal.addEventListener("click", () => openClientModal());
elements.addClientInline.addEventListener("click", () => openClientModal());

elements.receiptForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const clientId = document.getElementById("receiptClient").value;
  if (!clientId) {
    showToast("Selecione um cliente para gerar o comprovante.");
    return;
  }
  const receipt = {
    id: uid(),
    clientId,
    amount: document.getElementById("receiptAmount").value,
    service: document.getElementById("receiptService").value.trim(),
    paymentMethod: document.getElementById("receiptPaymentMethod").value.trim(),
    date: document.getElementById("receiptDate").value,
    notes: document.getElementById("receiptNotes").value.trim(),
    reference: `DT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
  };
  state.receipts.push(receipt);
  saveToStorage(STORAGE_KEYS.receipts, state.receipts);
  elements.receiptDialog.close();
  renderReceipts();
  elements.receiptForm.reset();
  showToast("Comprovante gerado. Visualize para imprimir.");
});

elements.createReceiptButton.addEventListener("click", () => {
  elements.receiptForm.reset();
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("receiptDate").value = today;
  elements.receiptDialog.showModal();
});

elements.notificationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const notification = {
    id: uid(),
    title: document.getElementById("notificationTitle").value.trim(),
    message: document.getElementById("notificationMessage").value.trim(),
    audience: elements.notificationAudience.value,
    createdAt: new Date().toISOString(),
    read: false,
  };

  if (!notification.title || !notification.message) {
    showToast("Informe título e mensagem.");
    return;
  }

  state.notifications.push(notification);
  saveToStorage(STORAGE_KEYS.notifications, state.notifications);
  elements.notificationDialog.close();
  renderNotifications();
  elements.notificationForm.reset();
  showToast("Notificação registrada.");
});

elements.openNotificationModal.addEventListener("click", () => {
  elements.notificationForm.reset();
  elements.notificationDialog.showModal();
});

hydrateState();
updateClientOptions();
renderClients();
renderMedia();
renderReceipts();
renderNotifications();
checkSession();
