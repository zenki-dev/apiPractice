const adventureGame = {
  form: document.getElementById("playerForm"),
  conn: "http://localhost:3000/",
  output: document.getElementById,
  init: () => {
    adventureGame.form?.addEventListener(
      "submit",
      adventureGame.postPlayerData,
    );
    document
      .getElementById("loadBtn")
      ?.addEventListener("click", adventureGame.loadPlayerData);
    document
      .getElementById("saveBtn")
      ?.addEventListener("click", adventureGame.savePlayerData);
    document
      .getElementById("deleteBtn")
      ?.addEventListener("click", adventureGame.deletePlayerData);
  },
  fetchData: async (params) => {
    try {
      const response = await fetch(adventureGame.conn + params);

      if (!response.ok) {
        console.log("error");
        return 0;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  },

  hideInfo: (idHide) => {
    const infoDiv = document.getElementById(idHide);
    infoDiv.classList.toggle("hidden");
  },

  fetchPlayerData: async () => {
    const search = document
      .getElementById("playerSearch")
      ?.value.trim()
      .toLowerCase();

    const playerDataEl = document.getElementById("playerData");

    const allPlayers = (await adventureGame.fetchData("players")) ?? [];
    const matched = search
      ? allPlayers.filter((p) => p.username?.toLowerCase() === search)
      : [];

    const result = !search
      ? "Please enter a player name"
      : allPlayers.length === 0
        ? "No player data available"
        : matched.length === 0
          ? "No player found"
          : matched
              .map(
                (p) =>
                  `${p.username} <br> Level: ${p.level}<br>Money: ${p.gold}<br>Last Seen: ${p.lastLogin}<br><br>`,
              )
              .join("");

    playerDataEl.classList.remove("hidden");
    playerDataEl.innerHTML = result;
    console.log(matched);
  },

  postPlayerData: async (event) => {
    event.preventDefault();
    try {
      const username = document.getElementById("playerUsername").value.trim();
      const email = document.getElementById("playerEmail").value.trim();
      const charId = Number(
        document.getElementById("playerCharacterId").value || 1,
      );

      if (!username || !email) {
        alert("Username and email are required.");
        return;
      }

      const players = await adventureGame.fetchData("players");

      const response = await fetch(adventureGame.conn + "players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(players.length + 1),
          username: username,
          email: email,
          level: Number(1),
          experience: Number(0),
          gold: Number(1000),
          characterId: Number(charId),
          guildId: Number(null),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Player created:", data);

      alert("Player created successfully!");
      adventureGame.form.reset();
    } catch (err) {
      console.error("Error creating player:", err);
    }
  },

  loadPlayerData: async (event) => {
    event.preventDefault();

    const id = Number(document.getElementById("updateId").value);
    const data = await adventureGame.fetchData(`players?id=${id}`);
    if (!data || data.length === 0) {
      alert("Player not found");
      return;
    }

    const player = data[0];
    console.log(data);
    document.getElementById("updateUsername").value = player.username;
    document.getElementById("updateEmail").value = player.email;
    document.getElementById("updateLevel").value = player.level;
    document.getElementById("updateExp").value = player.experience;
    document.getElementById("updateGold").value = player.gold;
    document.getElementById("updateGuildId").value = player.guildId;
  },

  savePlayerData: async (event) => {
    event.preventDefault();
    const id = Number(document.getElementById("updateId").value);
    const data = await adventureGame.fetchData(`players?id=${id}`);
    if (!data || data.length === 0) {
      alert("Player not found");
      return;
    }

    const player = data[0];

    const response = await fetch(`${adventureGame.conn}players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...player,
        id: Number(player.id),
        username: document.getElementById("updateUsername").value.trim(),
        email: document.getElementById("updateEmail").value.trim(),
        level: Number(document.getElementById("updateLevel").value),
        experience: Number(document.getElementById("updateExp").value),
        gold: Number(document.getElementById("updateGold").value),
        guildId: Number(document.getElementById("updateGuildId").value) || null,
      }),
    });

    // console.log(...player);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const datas = await response.json();
    console.log("Player updated:", datas);
    alert("Player updated successfully!");
  },

  deletePlayerData: async () => {
    const id = document.getElementById("deleteId").value;

    if (!id) {
      alert("Enter a player ID");
      return;
    }

    if (!confirm(`Are you sure you want to delete player ${id}?`)) {
      return;
    }

    const response = await fetch(`${adventureGame.conn}players/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    console.log(`Player ${id} deleted`);
    alert("Player deleted successfully!");
  },
};

document.addEventListener("DOMContentLoaded", () => {
  adventureGame.init();
});
