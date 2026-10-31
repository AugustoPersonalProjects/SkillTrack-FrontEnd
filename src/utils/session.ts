// As notificações são do usuário logado e não devem aparecer para o próximo
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("notifications");
}
