"use client";
// UI translations. The English text is the key; feed data (teams, leagues, news) stays as the feed sends it.
// The chosen language lives on <html lang> (set before paint by the layout script) and in localStorage.
import { useSyncExternalStore } from "react";

export const LANGS = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "pt", label: "Português" },
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "hi", label: "हिन्दी" },
] as const;
export type Lang = (typeof LANGS)[number]["id"];

// English key -> [es, pt, fr, de, hi]
const ROWS: Record<string, [string, string, string, string, string]> = {
  "Home": ["Inicio", "Início", "Accueil", "Start", "होम"],
  "Live": ["En vivo", "Ao vivo", "En direct", "Live", "लाइव"],
  "News": ["Noticias", "Notícias", "Actualités", "News", "समाचार"],
  "Profile": ["Perfil", "Perfil", "Profil", "Profil", "प्रोफ़ाइल"],
  "More": ["Más", "Mais", "Plus", "Mehr", "और"],
  "Search": ["Buscar", "Pesquisar", "Rechercher", "Suche", "खोजें"],
  "Live Scores": ["Resultados en vivo", "Placar ao vivo", "Scores en direct", "Live-Ergebnisse", "लाइव स्कोर"],
  "Match Centre": ["Centro del partido", "Central da partida", "Centre du match", "Spielzentrum", "मैच सेंटर"],
  "Top Events": ["Destacados", "Destaques", "À la une", "Top-Events", "टॉप इवेंट्स"],
  "Upcoming": ["Próximos", "Próximos", "À venir", "Demnächst", "आगामी"],
  "All": ["Todos", "Todos", "Tous", "Alle", "सभी"],
  "Finished": ["Finalizados", "Encerrados", "Terminés", "Beendet", "समाप्त"],
  "Search teams, leagues, news": ["Buscar equipos, ligas, noticias", "Pesquisar times, ligas, notícias", "Rechercher équipes, ligues, actus", "Teams, Ligen, News suchen", "टीम, लीग, समाचार खोजें"],
  "Filter": ["Filtro", "Filtro", "Filtre", "Filter", "फ़िल्टर"],
  "Reset": ["Restablecer", "Redefinir", "Réinitialiser", "Zurücksetzen", "रीसेट"],
  "Sport": ["Deporte", "Esporte", "Sport", "Sportart", "खेल"],
  "Status": ["Estado", "Status", "Statut", "Status", "स्थिति"],
  "No events right now.": ["No hay eventos ahora.", "Nenhum evento agora.", "Aucun événement pour le moment.", "Gerade keine Events.", "अभी कोई इवेंट नहीं।"],
  "Coming soon.": ["Próximamente.", "Em breve.", "Bientôt disponible.", "Demnächst verfügbar.", "जल्द आ रहा है।"],
  "Live Match": ["Partidos en vivo", "Jogos ao vivo", "Matchs en direct", "Live-Spiele", "लाइव मैच"],
  "Latest News": ["Últimas noticias", "Últimas notícias", "Dernières actualités", "Neueste News", "ताज़ा समाचार"],
  "See all": ["Ver todo", "Ver tudo", "Tout voir", "Alle ansehen", "सभी देखें"],
  "Cricket": ["Críquet", "Críquete", "Cricket", "Cricket", "क्रिकेट"],
  "Football": ["Fútbol", "Futebol", "Football", "Fußball", "फ़ुटबॉल"],
  "Tennis": ["Tenis", "Tênis", "Tennis", "Tennis", "टेनिस"],
  "Horse Racing": ["Hípica", "Turfe", "Courses hippiques", "Pferderennen", "घुड़दौड़"],
  "Basketball": ["Baloncesto", "Basquete", "Basket-ball", "Basketball", "बास्केटबॉल"],
  "Kabaddi": ["Kabaddi", "Kabaddi", "Kabaddi", "Kabaddi", "कबड्डी"],
  "Scores are taking a breather": ["Los marcadores se toman un respiro", "O placar está dando uma pausa", "Les scores font une pause", "Die Ergebnisse machen kurz Pause", "स्कोर थोड़ी देर के लिए रुके हैं"],
  "Try again": ["Reintentar", "Tentar novamente", "Réessayer", "Erneut versuchen", "फिर से कोशिश करें"],
  "Favourites": ["Favoritos", "Favoritos", "Favoris", "Favoriten", "पसंदीदा"],
  "Alerts": ["Alertas", "Alertas", "Alertes", "Alarme", "अलर्ट"],
  "Live scores, news & stats.": ["Resultados, noticias y estadísticas en vivo.", "Placar, notícias e estatísticas ao vivo.", "Scores, actus et stats en direct.", "Live-Ergebnisse, News & Statistiken.", "लाइव स्कोर, समाचार और आँकड़े।"],
  "Stay updated. Stay ahead.": ["Mantente al día. Ve un paso adelante.", "Fique por dentro. Saia na frente.", "Restez informé. Gardez une longueur d'avance.", "Immer informiert. Immer vorn.", "अपडेट रहें। आगे रहें।"],
  "Preferences": ["Preferencias", "Preferências", "Préférences", "Präferenzen", "प्राथमिकताएँ"],
  "Notifications": ["Notificaciones", "Notificações", "Notifications", "Mitteilungen", "सूचनाएँ"],
  "Goals, wickets and full-time alerts": ["Alertas de goles, wickets y final", "Alertas de gols, wickets e fim de jogo", "Alertes buts, wickets et fin de match", "Tore, Wickets und Abpfiff", "गोल, विकेट और फुल-टाइम अलर्ट"],
  "Language": ["Idioma", "Idioma", "Langue", "Sprache", "भाषा"],
  "Dark mode": ["Modo oscuro", "Modo escuro", "Mode sombre", "Dunkelmodus", "डार्क मोड"],
  "Easy on the eyes at night": ["Descansa la vista de noche", "Mais confortável à noite", "Plus doux pour les yeux la nuit", "Schont nachts die Augen", "रात में आँखों को आराम"],
  "App": ["App", "App", "Application", "App", "ऐप"],
  "Share app": ["Compartir app", "Compartilhar app", "Partager l'appli", "App teilen", "ऐप शेयर करें"],
  "Invite friends to 1stLive247": ["Invita a tus amigos a 1stLive247", "Convide amigos para o 1stLive247", "Invitez vos amis sur 1stLive247", "Freunde zu 1stLive247 einladen", "दोस्तों को 1stLive247 पर बुलाएँ"],
  "Settings": ["Ajustes", "Configurações", "Paramètres", "Einstellungen", "सेटिंग्स"],
  "About 1stLive247": ["Acerca de 1stLive247", "Sobre o 1stLive247", "À propos de 1stLive247", "Über 1stLive247", "1stLive247 के बारे में"],
  "No stories yet.": ["Aún no hay noticias.", "Ainda não há notícias.", "Pas encore d'articles.", "Noch keine Artikel.", "अभी कोई खबर नहीं।"],
  "Related": ["Relacionadas", "Relacionadas", "À lire aussi", "Ähnliche Artikel", "संबंधित"],
  "Yet to bat": ["Sin batear", "Ainda não rebateu", "Pas encore au bâton", "Noch nicht am Schlag", "बल्लेबाज़ी बाकी"],
  "Live scores": ["Resultados en vivo", "Placar ao vivo", "Scores en direct", "Live-Ergebnisse", "लाइव स्कोर"],
  "Live scores, results and sports news. Always on for sports.": ["Resultados en vivo, marcadores y noticias deportivas. Siempre con el deporte.", "Placar ao vivo, resultados e notícias esportivas. Sempre ligado no esporte.", "Scores en direct, résultats et actus sport. Toujours branché sport.", "Live-Ergebnisse, Resultate und Sportnews. Immer am Ball.", "लाइव स्कोर, नतीजे और खेल समाचार। हमेशा खेल के साथ।"],
  "Overview": ["Resumen", "Resumo", "Aperçu", "Übersicht", "ओवरव्यू"],
  "Scorecard": ["Marcador", "Súmula", "Feuille de match", "Scorecard", "स्कोरकार्ड"],
  "Commentary": ["Comentarios", "Narração", "Commentaires", "Kommentar", "कमेंट्री"],
  "Fall of wickets": ["Caída de wickets", "Queda de wickets", "Chute des guichets", "Wicket-Fälle", "विकेट पतन"],
  "Live now": ["En vivo ahora", "Ao vivo agora", "En direct", "Jetzt live", "अभी लाइव"],
  "No live matches right now.": ["No hay partidos en vivo ahora.", "Nenhum jogo ao vivo agora.", "Aucun match en direct pour le moment.", "Gerade keine Live-Spiele.", "अभी कोई लाइव मैच नहीं।"],
  "Detailed coverage for this match is coming soon.": ["La cobertura detallada de este partido llegará pronto.", "A cobertura detalhada desta partida chega em breve.", "La couverture détaillée de ce match arrive bientôt.", "Ausführliche Berichte zu diesem Spiel folgen in Kürze.", "इस मैच की पूरी कवरेज जल्द आएगी।"],
  "Type a team, league or headline.": ["Escribe un equipo, liga o titular.", "Digite um time, liga ou manchete.", "Tapez une équipe, une ligue ou un titre.", "Team, Liga oder Schlagzeile eingeben.", "टीम, लीग या हेडलाइन लिखें।"],
  "Matches": ["Partidos", "Jogos", "Matchs", "Spiele", "मैच"],
  "Match momentum": ["Dinámica del partido", "Momento da partida", "Dynamique du match", "Spielverlauf", "मैच मोमेंटम"],
  "Key stats": ["Estadísticas clave", "Estatísticas principais", "Stats clés", "Wichtige Statistiken", "मुख्य आँकड़े"],
  "Possession": ["Posesión", "Posse", "Possession", "Ballbesitz", "पज़ेशन"],
  "Key events": ["Momentos clave", "Lances principais", "Faits marquants", "Wichtige Ereignisse", "मुख्य घटनाएँ"],
  "Statistics": ["Estadísticas", "Estatísticas", "Statistiques", "Statistiken", "आँकड़े"],
  "Match info": ["Info del partido", "Info da partida", "Infos du match", "Spielinfo", "मैच जानकारी"],
  "Draw": ["Empate", "Empate", "Nul", "Unentschieden", "ड्रॉ"],
  "Win probability": ["Probabilidad de victoria", "Probabilidade de vitória", "Probabilité de victoire", "Siegwahrscheinlichkeit", "जीत की संभावना"],
  "Head-to-head": ["Cara a cara", "Confronto direto", "Face-à-face", "Direkter Vergleich", "आमने-सामने"],
  "Draws": ["Empates", "Empates", "Nuls", "Unentschieden", "ड्रॉ"],
  "Team": ["Equipo", "Time", "Équipe", "Team", "टीम"],
  "This over": ["Este over", "Este over", "Cet over", "Dieses Over", "यह ओवर"],
  "Welcome to 1stLive247": ["Bienvenido a 1stLive247", "Bem-vindo ao 1stLive247", "Bienvenue sur 1stLive247", "Willkommen bei 1stLive247", "1stLive247 में आपका स्वागत है"],
  "Pick the sports you follow": ["Elige los deportes que sigues", "Escolha os esportes que você acompanha", "Choisissez les sports que vous suivez", "Wähle deine Sportarten", "अपने पसंदीदा खेल चुनें"],
  "Your first pick opens by default.": ["Tu primera elección se abrirá por defecto.", "Sua primeira escolha abre por padrão.", "Votre premier choix s'ouvre par défaut.", "Deine erste Wahl öffnet sich standardmäßig.", "आपकी पहली पसंद सबसे पहले खुलेगी।"],
  "Continue": ["Continuar", "Continuar", "Continuer", "Weiter", "आगे बढ़ें"],
  "Skip": ["Omitir", "Pular", "Passer", "Überspringen", "छोड़ें"],
  "Your sports": ["Tus deportes", "Seus esportes", "Vos sports", "Deine Sportarten", "आपके खेल"],
  "Choose your language": ["Elige tu idioma", "Escolha seu idioma", "Choisissez votre langue", "Wähle deine Sprache", "अपनी भाषा चुनें"],
  "You can change it any time in More.": ["Puedes cambiarlo cuando quieras en Más.", "Você pode mudar a qualquer momento em Mais.", "Modifiable à tout moment dans Plus.", "Jederzeit unter Mehr änderbar.", "इसे कभी भी 'और' में बदल सकते हैं।"],
  "Pick as many as you like.": ["Elige todos los que quieras.", "Escolha quantos quiser.", "Choisissez-en autant que vous voulez.", "Wähle so viele du willst.", "जितने चाहें उतने चुनें।"],
  "Which sport should open first?": ["¿Qué deporte se abre primero?", "Qual esporte abre primeiro?", "Quel sport ouvrir en premier ?", "Welche Sportart zuerst öffnen?", "सबसे पहले कौन सा खेल खुले?"],
  "Home will always open on this sport.": ["Inicio siempre se abrirá en este deporte.", "O início sempre abrirá neste esporte.", "L'accueil s'ouvrira toujours sur ce sport.", "Start öffnet immer mit dieser Sportart.", "होम हमेशा इसी खेल पर खुलेगा।"],
  "Step": ["Paso", "Passo", "Étape", "Schritt", "चरण"],
  "Back": ["Atrás", "Voltar", "Retour", "Zurück", "वापस"],
  "Let's go": ["¡Vamos!", "Vamos lá", "C'est parti", "Los geht's", "चलिए शुरू करें"],
  "Appearance": ["Apariencia", "Aparência", "Apparence", "Darstellung", "दिखावट"],
  "Light": ["Claro", "Claro", "Clair", "Hell", "लाइट"],
  "Dark": ["Oscuro", "Escuro", "Sombre", "Dunkel", "डार्क"],
  "Auto": ["Auto", "Auto", "Auto", "Auto", "ऑटो"],
  "About": ["Acerca de", "Sobre", "À propos", "Über uns", "हमारे बारे में"],
  "Privacy & terms": ["Privacidad y términos", "Privacidade e termos", "Confidentialité et conditions", "Datenschutz & AGB", "गोपनीयता और शर्तें"],
  "Link copied": ["Enlace copiado", "Link copiado", "Lien copié", "Link kopiert", "लिंक कॉपी हुआ"],
  "Guest": ["Invitado", "Visitante", "Invité", "Gast", "मेहमान"],
  "Add your name and photo": ["Añade tu nombre y foto", "Adicione seu nome e foto", "Ajoutez votre nom et une photo", "Name und Foto hinzufügen", "अपना नाम और फ़ोटो जोड़ें"],
  "Edit profile": ["Editar perfil", "Editar perfil", "Modifier le profil", "Profil bearbeiten", "प्रोफ़ाइल बदलें"],
  "Add photo": ["Añadir foto", "Adicionar foto", "Ajouter une photo", "Foto hinzufügen", "फ़ोटो जोड़ें"],
  "Change photo": ["Cambiar foto", "Trocar foto", "Changer la photo", "Foto ändern", "फ़ोटो बदलें"],
  "Remove photo": ["Quitar foto", "Remover foto", "Supprimer la photo", "Foto entfernen", "फ़ोटो हटाएँ"],
  "Name": ["Nombre", "Nome", "Nom", "Name", "नाम"],
  "Your name": ["Tu nombre", "Seu nome", "Votre nom", "Dein Name", "आपका नाम"],
  "Email": ["Correo", "E-mail", "E-mail", "E-Mail", "ईमेल"],
  "Favourite team": ["Equipo favorito", "Time favorito", "Équipe favorite", "Lieblingsteam", "पसंदीदा टीम"],
  "e.g. India, Real Madrid": ["p. ej. India, Real Madrid", "ex.: Índia, Real Madrid", "ex. Inde, Real Madrid", "z. B. Indien, Real Madrid", "जैसे भारत, रियल मैड्रिड"],
  "Save": ["Guardar", "Salvar", "Enregistrer", "Speichern", "सेव करें"],
  "Enter a valid email.": ["Introduce un correo válido.", "Digite um e-mail válido.", "Saisissez un e-mail valide.", "Gib eine gültige E-Mail ein.", "सही ईमेल डालें।"],
  "Please pick an image file.": ["Elige un archivo de imagen.", "Escolha um arquivo de imagem.", "Choisissez une image.", "Bitte wähle eine Bilddatei.", "कृपया कोई इमेज फ़ाइल चुनें।"],
  "Couldn't save on this device.": ["No se pudo guardar en este dispositivo.", "Não foi possível salvar neste dispositivo.", "Impossible d'enregistrer sur cet appareil.", "Auf diesem Gerät nicht speicherbar.", "इस डिवाइस पर सेव नहीं हो सका।"],
  "Tap to follow or unfollow.": ["Toca para seguir o dejar de seguir.", "Toque para seguir ou deixar de seguir.", "Touchez pour suivre ou ne plus suivre.", "Tippen zum Folgen oder Entfolgen.", "फ़ॉलो या अनफ़ॉलो करने के लिए टैप करें।"],
  "Opens first": ["Se abre primero", "Abre primeiro", "S'ouvre en premier", "Öffnet zuerst", "सबसे पहले खुलेगा"],
  "Runs": ["Carreras", "Corridas", "Points", "Runs", "रन"],
  "Wicket": ["Wicket", "Wicket", "Guichet", "Wicket", "विकेट"],
  "Over": ["Over", "Over", "Over", "Over", "ओवर"],
  "Partnership": ["Asociación", "Parceria", "Partenariat", "Partnerschaft", "साझेदारी"],
  "Less": ["Menos", "Menos", "Moins", "Weniger", "कम"],
  "Edit": ["Editar", "Editar", "Modifier", "Bearbeiten", "बदलें"],
  "Pick at least one sport": ["Elige al menos un deporte", "Escolha pelo menos um esporte", "Choisissez au moins un sport", "Wähle mindestens eine Sportart", "कम से कम एक खेल चुनें"],
};
const COL: Record<Exclude<Lang, "en">, number> = { es: 0, pt: 1, fr: 2, de: 3, hi: 4 };

export function translate(lang: Lang, s: string) {
  return lang === "en" ? s : ROWS[s]?.[COL[lang]] ?? s;
}

const isLang = (v: string | null): v is Lang => LANGS.some((l) => l.id === v);
const read = (): Lang => { const l = document.documentElement.lang; return isLang(l) ? l : "en"; };
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => mo.disconnect();
};

/** Current UI language; "en" on the server and during hydration, then the saved one. */
export const useLang = () => useSyncExternalStore(subscribe, read, () => "en" as Lang);
export function useT() {
  const lang = useLang();
  return (s: string) => translate(lang, s);
}
/** Translated text, usable from server components: <T>Live Scores</T> */
export function T({ children }: { children: string }) {
  return useT()(children);
}

export function setLang(l: Lang) {
  document.documentElement.lang = l;
  try { localStorage.setItem("lang", l); } catch {}
}
