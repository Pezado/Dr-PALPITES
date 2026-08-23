
import React, { useState, useEffect, useMemo, useCallback, useRef, Component } from "react";
import ReactDOM from "react-dom/client";
import { 
  LayoutDashboard, 
  Layers, 
  X, 
  Ticket, 
  Save, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  Target, 
  Moon, 
  Sun,
  User,
  Eye, 
  EyeOff,
  Lock, 
  Phone, 
  MapPin, 
  Calendar, 
  LogOut, 
  Globe, 
  Menu, 
  Facebook, 
  MessageCircle, 
  Send, 
  Crown, 
  LockKeyhole, 
  Copy, 
  Check, 
  Flag, 
  DollarSign,
  Bell,
  ClipboardCheck,
  ChevronLeft,
  HelpCircle,
  Camera,
  Heart,
  MessageSquare,
  MoreVertical,
  UserPlus,
  Users,
  Gift,
  Trophy,
  History,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  BookOpen
} from "lucide-react";
import { db } from "./firebase";
import { 
  ref, 
  onValue, 
  set, 
  push, 
  update, 
  get, 
  child,
  serverTimestamp
} from "firebase/database";

// --- Error Boundary Component ---
class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, errorInfo: "" };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle size={64} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-black mb-2">OPS! ALGO CORREU MAL</h1>
          <p className="text-zinc-400 text-sm mb-6 max-w-md">Ocorreu um erro inesperado. Por favor, tente novamente.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-amber-500 text-black font-black px-8 py-3 rounded-xl uppercase italic shadow-lg active:scale-95 transition-all"
          >
            Recarregar App
          </button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// --- Links Sociais ---
const FIREBASE_URL = "https://toneladas-palpites-default-rtdb.firebaseio.com";

// --- Dados de Países e Províncias Atualizados ---
const COUNTRY_DATA = [
  { name: "ANGOLA", code: "+244", flag: "🇦🇴", min: 9, max: 9, provinces: ["Bengo", "Benguela", "Bié", "Cabinda", "Cuando", "Cuanza Norte", "Cuanza Sul", "Cubango", "Cunene", "Huambo", "Huíla", "Ícolo e Bengo", "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Moxico Leste", "Namibe", "Uíge", "Zaire"] },
  { name: "BRASIL", code: "+55", flag: "🇧🇷", min: 10, max: 11, provinces: ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins", "Distrito Federal"] },
  { name: "PORTUGAL", code: "+351", flag: "🇵🇹", min: 9, max: 9, provinces: ["Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro", "Guarda", "Leiria", "Lisboa", "Portalegre", "Porto", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu", "Açores", "Madeira"] },
  { name: "MOÇAMBIQUE", code: "+258", flag: "🇲🇿", min: 9, max: 9, provinces: ["Cabo Delgado", "Gaza", "Inhambane", "Manica", "Maputo (Cidade)", "Maputo (Província)", "Nampula", "Niassa", "Sofala", "Tete", "Zambézia"] },
  { name: "ESPANHA", code: "+34", flag: "🇪🇸", min: 9, max: 9, provinces: ["Álava", "Albacete", "Alicante", "Almería", "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Gerona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León", "Lérida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza", "Baleares", "Cantabria", "Asturias"] },
  { name: "ESTADOS UNIDOS", code: "+1", flag: "🇺🇸", min: 10, max: 10, provinces: ["Califórnia", "Texas", "Flórida", "Nova Iorque", "Pensilvânia", "Illinois", "Ohio", "Geórgia", "Carolina do Norte", "Michigan", "Nova Jersey", "Virgínia", "Washington", "Arizona", "Tennessee"] },
  { name: "ÁFRICA DO SUL", code: "+27", flag: "🇿🇦", min: 9, max: 9, provinces: ["Gauteng", "KwaZulu-Natal", "Western Cape", "Eastern Cape", "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape"] },
  { name: "ALEMANHA", code: "+49", flag: "🇩🇪", min: 10, max: 11, provinces: ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"] },
  { name: "REINO UNIDO", code: "+44", flag: "🇬🇧", min: 10, max: 10, provinces: ["Greater London", "West Midlands", "Greater Manchester", "West Yorkshire", "Hampshire", "Kent", "Essex", "Lancashire", "Merseyside", "South Yorkshire", "Devon", "Surrey", "Hertfordshire", "North Yorkshire"] },
  { name: "ARGENTINA", code: "+54", flag: "🇦🇷", min: 10, max: 10, provinces: ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán", "Entre Ríos", "Salta", "Misiones", "Chaco", "Corrientes"] },
  { name: "ITÁLIA", code: "+39", flag: "🇮🇹", min: 10, max: 10, provinces: ["Lombardia", "Lazio", "Campania", "Veneto", "Sicilia", "Piemonte", "Emilia-Romagna", "Puglia", "Toscana", "Calabria"] },
  { name: "NIGÉRIA", code: "+234", flag: "🇳🇬", min: 10, max: 10, provinces: ["Lagos", "Kano", "Oyo", "Kaduna", "Rivers", "Katsina", "Bauchi", "Anambra", "Jigawa", "Benue"] },
  { name: "SÃO TOMÉ E PRÍNCIPE", code: "+239", flag: "🇸🇹", min: 7, max: 7, provinces: ["Água Grande", "Mé-Zóchi", "Cantagalo", "Caué", "Lembá", "Lobata", "Pagué (Príncipe)"] },
  { name: "GUINÉ-BISSAU", code: "+245", flag: "🇬🇼", min: 7, max: 7, provinces: ["Bissau", "Bafatá", "Gabú", "Oio", "Quinara", "Tombali", "Cacheu", "Biombo", "Bolama"] },
  { name: "MARROCOS", code: "+212", flag: "🇲🇦", min: 9, max: 9, provinces: ["Casablanca-Settat", "Rabat-Salé-Kénitra", "Fès-Meknès", "Tanger-Tétouan-Al Hoceïma", "Marrakech-Safi", "Béni Mellal-Khénifra", "Oriental", "Souss-Massa", "Drâa-Tafilalet", "Guelmim-Oued Noun"] },
  { name: "EGITO", code: "+20", flag: "🇪🇬", min: 10, max: 10, provinces: ["Cairo", "Giza", "Alexandria", "Dakahlia", "Sharqia", "Beheira", "Minya", "Qalyubia", "Sohag", "Gharbia"] },
  { name: "CHINA", code: "+86", flag: "🇨🇳", min: 11, max: 11, provinces: ["Guangdong", "Jiangsu", "Shandong", "Zhejiang", "Henan", "Sichuan", "Hubei", "Hunan", "Fujian", "Anhui"] },
  { name: "CABO VERDE", code: "+238", flag: "🇨🇻", min: 7, max: 7, provinces: ["Praia", "Mindelo", "Santa Maria", "Tarfall", "Espargos", "Ribeira Grande", "Assomada"] },
  { name: "FRANÇA", code: "+33", flag: "🇫🇷", min: 9, max: 9, provinces: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"] },
  { name: "OUTRO", code: "", flag: "🌐", min: 5, max: 15, provinces: [] },
].sort((a, b) => a.name === "OUTRO" ? 1 : b.name === "OUTRO" ? -1 : a.name.localeCompare(b.name));

// --- Interfaces ---
interface UserProfile {
  uid: string;
  username: string;
  country: string;
  password?: string;
  phone: string;
  province: string;
  age: string;
  isVip?: boolean;
  vipExpiry?: number;
  profilePic?: string;
  referralCode?: string;
  invitedBy?: string;
  claimedInvites?: number;
}

interface Match {
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
  tips: any[]; 
  isVipMatch?: boolean;
}

interface Ficha {
  id?: string;
  type: string;
  totalOdds: string | number;
  selections: any[];
  startTime?: string;
  stake?: string;
  estimatedReturn?: string;
  assertiveness?: number;
  elephantBetId?: string;
  premierBetId?: string;
  bantuBetId?: string;
  source?: string;
  createdAt?: number;
  winCertifiedAt?: number;
  date?: string;
}

interface ChatMessage {
  id: string;
  uid: string;
  username: string;
  text: string;
  timestamp: number;
  profilePic?: string;
}

interface Referral {
  uid: string;
  username: string;
  timestamp: number;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface AlertData {
  titulo: string;
  mensagem: string;
  mostrar: string;
  token?: string;
}

type Lang = 'pt' | 'en' | 'fr' | 'es';

const TRANSLATIONS: Record<Lang, any> = {
  pt: {
    promoTitle: "VENCE COM A ELITE",
    promoText: "JUNTA-TE A MILHARES DE VENCEDORES. A NOSSA IA PROCESSA MILHÕES DE DADOS PARA TE ENTREGAR OS PALPITES MAIS ASSERTIVOS DO MERCADO.",
    login: "ENTRAR",
    register: "CRIAR CONTA",
    username: "NOME DE USUÁRIO",
    password: "PALAVRA-PASSE",
    phone: "TELEMÓVEL",
    province: "PROVÍNCIA",
    age: "IDADE",
    country: "PAÍS",
    enterNow: "ENTRAR AGORA",
    finishReg: "FINALIZAR REGISTO",
    welcome: "BEM-VINDO AO TOPO",
    palpites: "Hoje",
    fichas: "Fichas",
    boletim: "Boletim",
    guardados: "Salvo",
    userNotFound: "USUÁRIO NÃO EXISTE",
    wrongPass: "PALAVRA-PASSE INCORRETA",
    authError: "FALHA NA AUTENTICAÇÃO",
    accCreated: "CONTA CRIADA COM SUCESSO!",
    welcomeBack: "BEM-VINDO DE VOLTA!",
    saved: "BOLETIM GUARDADO!",
    vazio: "SEM DADOS PARA HOJE",
    settings: "CONFIGURAÇÕES",
    theme: "TEMA",
    lang: "IDIOMA",
    logout: "SAIR",
    support: "SUPORTE",
    followUs: "SEGUE-NOS",
    community: "COMMUNIDADE",
    vipRestrictedTitle: "ACESSO EXCLUSIVO VIP",
    vipRestrictedText: "AS FICHAS PREMIUM SÃO RESERVADOS PARA MEMBROS DA NOSSA ELITE. AUMENTE SEUS GANHOS COM AS MELHORES COMBINAÇÕES DE ODDS ANALISADAS PELA NOSSA IA.",
    vipExpiredText: "O TEU ACESSO VIP EXPIROU. RENOVA AGORA PARA CONTINUAR A RECEBER AS MELHORES FICHAS DO MERCADO!",
    talkToCeo: "FALAR COM O CEO",
    vipWhatsappMsg: "Olá, quero comprar o acesso VIP ao DR PALPITES.",
    tickerText: "🔥 TORNE-SE VIP AGORA E TENHA ACESSO AOS MELHORES COMBOS ACUMULADORES COM ASSERTIVIDADE ACIMA DE 90%! CLIQUE NO MENU E COMPRE SEU ACESSO! 🔥",
    copySuccess: "ID COPIADO!",
    buyVip: "COMPRAR ACESSO VIP",
    vipStatus: "USUÁRIO VIP",
    daysRemaining: "DIAS RESTANTES",
    talkWithUs: "FALAR CONNOSCO",
    invalidPhone: "NÚMERO DE TELEFONE INVÁLIDO!",
    accountExists: "CONTA JÁ EXISTE COM ESTE NÚMERO!",
    stakeAmount: "VALOR A APOSTAR",
    potentialWinnings: "GANHO POTENCIAL",
    vipOnlyContent: "CONTEÚDO VIP",
    vipOnlyMatch: "PARTIDA VIP EXCLUSIVA",
    bookieId: "ID DA CASA",
    copyId: "COPIAR ID",
    forgotPass: "ESQUECEU A SENHA?",
    newPassword: "NOVA PALAVRA-PASSE",
    confirmPassword: "REPETIR PALAVRA-PASSE",
    verifyUser: "VERIFICAR CONTA",
    updatePass: "ATUALIZAR PALAVRA-PASSE",
    userFound: "CONTA ENCONTRADA PARA:",
    passMismatch: "AS PALAVRAS-PASSE NÃO COINCIDEM!",
    passUpdated: "PALAVRA-PASSE ATUALIZADA!",
    createAccPrompt: "CONTA NÃO ENCONTRADA. POR FAVOR, CRIE UMA CONTA.",
    needHelp: "PRECISA DE AJUDA?",
    returnToLogin: "VOLTAR AO LOGIN",
    todayMatches: "PARTIDAS DE HOJE",
    myTickets: "MEUS TICKETS",
    stake: "APOSTA",
    totalWinnings: "TOTAL GANHOS",
    ok: "OK",
    comboElite: "FICHAS ELITE",
    precisionAnalysis: "ANÁLISE DE PRECISÃO",
    totalOdds: "ODD TOTAL",
    chat: "Chat",
    sendMessage: "Enviar",
    typeMessage: "Escreva algo...",
    noMessages: "Nenhuma mensagem ainda.",
    footerInfo: "Temos IDs prontos para todas as casas e palpites de empate no VIP!",
    profilePic: "Foto de Perfil",
    addComment: "Comentar...",
    publicAccumulator: "FICHA PÚBLICA",
    referralCode: "CÓDIGO DE CONVITE (OPCIONAL)",
    generateReferral: "GERAR CÓDIGO",
    referralTitle: "ZONA DE CONVITES",
    referralInfo: "Convide 20 amigos e ganhe 4 dias VIP grátis! (2 dias a cada 10 convidados)",
    yourCode: "SEU CÓDIGO:",
    totalInvites: "TOTAL DE CONVITES:",
    inviteList: "LISTA DE CONVIDADOS:",
    noInvites: "Nenhum convidado ainda.",
    daysEarned: "DIAS VIP DISPONÍVEIS:",
    claimPrize: "RESGATAR PRÉMIO VIP",
    claimSuccess: "PRÉMIO RESGATADO COM SUCESSO!",
    minClaimMsg: "Saque mínimo de 20 convidados para resgatar o VIP!",
    unclaimedInvites: "CONVITES NÃO RESGATADOS:",
    copyCode: "COPIAR CÓDIGO",
    historico: "Histórico",
    historicoVazio: "AINDA NÃO HÁ REGISTOS DE VITÓRIA",
    vitoriaIA: "VITÓRIA IA",
    resultadoGanho: "RESULTADO: GANHO ✅",
    motto: "Não aposta na sorte...aposta na ciência .!"
  },
  en: {
    promoTitle: "WIN WITH THE ELITE",
    promoText: "JOIN THOUSANDS OF WINNERS. OUR AI PROCESSES MILLIONS OF DATA POINTS TO DELIVER THE MOST ACCURATE PREDICTIONS.",
    login: "LOGIN",
    register: "SIGN UP",
    username: "USERNAME",
    password: "PASSWORD",
    phone: "PHONE NUMBER",
    province: "PROVINCE",
    age: "AGE",
    country: "COUNTRY",
    enterNow: "ENTER NOW",
    finishReg: "FINISH REGISTRATION",
    welcome: "WELCOME TO THE TOP",
    palpites: "Today",
    fichas: "Fichas",
    boletim: "Ticket",
    guardados: "Saved",
    userNotFound: "USER NOT FOUND",
    wrongPass: "INCORRECT PASSWORD",
    authError: "AUTHENTICATION FAILED",
    accCreated: "ACCOUNT CREATED SUCCESSFULLY!",
    welcomeBack: "WELCOME BACK!",
    saved: "TICKET SAVED!",
    vazio: "NO DATA FOR TODAY",
    settings: "SETTINGS",
    theme: "THEME",
    lang: "LANGUAGE",
    logout: "LOGOUT",
    support: "SUPPORT",
    followUs: "FOLLOW US",
    community: "COMMUNITY",
    vipRestrictedTitle: "EXCLUSIVE VIP ACCESS",
    vipRestrictedText: "PREMIUM FICHAS ARE RESERVED FOR OUR ELITE MEMBERS.",
    vipExpiredText: "YOUR VIP ACCESS HAS EXPIRED.",
    talkToCeo: "TALK TO CEO",
    vipWhatsappMsg: "Hello, I want to buy VIP access to DR PALPITES.",
    tickerText: "🔥 BECOME VIP NOW FOR 90%+ ACCURACY!",
    copySuccess: "ID COPIED!",
    buyVip: "BUY VIP ACCESS",
    vipStatus: "VIP USER",
    daysRemaining: "DAYS REMAINING",
    talkWithUs: "TALK WITH US",
    invalidPhone: "INVALID PHONE NUMBER!",
    accountExists: "ACCOUNT ALREADY EXISTS!",
    stakeAmount: "STAKE AMOUNT",
    potentialWinnings: "POTENTIAL WINNINGS",
    vipOnlyContent: "VIP CONTENT",
    vipOnlyMatch: "EXCLUSIVE VIP MATCH",
    bookieId: "HOUSE ID",
    copyId: "COPY ID",
    forgotPass: "FORGOT PASSWORD?",
    newPassword: "NEW PASSWORD",
    confirmPassword: "REPEAT PASSWORD",
    verifyUser: "VERIFY ACCOUNT",
    updatePass: "UPDATE PASSWORD",
    userFound: "ACCOUNT FOUND FOR:",
    passMismatch: "PASSWORDS DO NOT MATCH!",
    passUpdated: "PASSWORD UPDATED!",
    createAccPrompt: "ACCOUNT NOT FOUND.",
    needHelp: "NEED HELP?",
    returnToLogin: "RETURN TO LOGIN",
    todayMatches: "TODAY'S MATCHES",
    myTickets: "MY TICKETS",
    stake: "STAKE",
    totalWinnings: "TOTAL WINNINGS",
    ok: "OK",
    comboElite: "ELITE FICHAS",
    precisionAnalysis: "PRECISION ANALYSIS",
    totalOdds: "TOTAL ODD",
    chat: "Chat",
    sendMessage: "Send",
    typeMessage: "Type something...",
    noMessages: "No messages yet.",
    footerInfo: "Ready IDs for all bookies and Draw tips in VIP!",
    profilePic: "Profile Picture",
    addComment: "Comment...",
    publicAccumulator: "PUBLIC FICHA",
    referralCode: "REFERRAL CODE (OPTIONAL)",
    generateReferral: "GENERATE CODE",
    referralTitle: "INVITE ZONE",
    referralInfo: "Invite 20 friends and get 4 free VIP days! (2 days per 10 guests)",
    yourCode: "YOUR CODE:",
    totalInvites: "TOTAL INVITES:",
    inviteList: "GUEST LIST:",
    noInvites: "No invites yet.",
    daysEarned: "VIP DAYS AVAILABLE:",
    claimPrize: "CLAIM VIP PRIZE",
    claimSuccess: "PRIZE CLAIMED SUCCESSFULLY!",
    minClaimMsg: "Minimum 20 guests to claim VIP!",
    unclaimedInvites: "UNCLAIMED INVITES:",
    copyCode: "COPY CODE",
    historico: "History",
    historicoVazio: "NO WIN RECORDS YET",
    vitoriaIA: "AI WIN",
    resultadoGanho: "RESULT: WON ✅",
    motto: "Don't bet on luck...bet on science.!"
  },
  fr: {
    promoTitle: "GAGNEZ AVEC L'ÉLITE",
    promoText: "REJOIGNEZ DES MILLIERS DE GAGNANTS.",
    login: "SE CONNECTER",
    register: "S'INSCRIRE",
    username: "NOM D'UTILISATEUR",
    password: "MOT DE PASSE",
    phone: "TÉLÉPHONE",
    province: "PROVINCE",
    age: "ÂGE",
    country: "PAYS",
    enterNow: "ENTRER MAINTENANT",
    finishReg: "TERMINER L'INSCRIPTION",
    welcome: "BIENVENUE AU SOMMET",
    palpites: "Hoje",
    fichas: "Fiches",
    boletim: "Ticket",
    guardados: "Enregistré",
    userNotFound: "UTILISATEUR NON TROUVÉ",
    wrongPass: "MOT DE PASSE INCORRECT",
    authError: "ÉCHEC D'AUTHENTIFICATION",
    accCreated: "COMPTE CRÉÉ!",
    welcomeBack: "RE-BIENVENUE!",
    saved: "TICKET SAUVÉ!",
    vazio: "SANS DONNÉES",
    settings: "PARAMÈTRES",
    theme: "THÈME",
    lang: "LANGUE",
    logout: "DÉCONNEXION",
    support: "SUPPORT",
    followUs: "SUIVEZ-NOUS",
    community: "COMMUNAUTÉ",
    vipRestrictedTitle: "ACCÈS VIP EXCLUSIF",
    vipRestrictedText: "FICHES RÉSERVÉES À L'ÉLITE.",
    vipExpiredText: "VIP EXPIRÉ.",
    talkToCeo: "PARLER AU PDG",
    vipWhatsappMsg: "Bonjour, je veux acheter l'accès VIP.",
    tickerText: "🔥 DEVENEZ VIP MAINTENANT !",
    copySuccess: "ID COPIÉ!",
    buyVip: "ACHETER VIP",
    vipStatus: "UTILISATEUR VIP",
    daysRemaining: "JOURS RESTANTS",
    talkWithUs: "PARLER",
    invalidPhone: "TÉLÉPHONE INVALIDE!",
    accountExists: "COMPTE EXISTE DÉJÀ!",
    stakeAmount: "MISE",
    potentialWinnings: "GAINS POTENTIELS",
    vipOnlyContent: "CONTENU VIP",
    vipOnlyMatch: "MATCH VIP",
    bookieId: "ID BOOKMAKER",
    copyId: "COPIER ID",
    forgotPass: "OUBLIÉ?",
    newPassword: "NOUVEAU MOT DE PASSE",
    confirmPassword: "REPETEZ",
    verifyUser: "VÉRIFIER",
    updatePass: "METTRE À JOUR",
    userFound: "COMPTE TROUVÉ:",
    passMismatch: "PAS DE CORRESPONDANCE!",
    passUpdated: "MIS À JOUR!",
    createAccPrompt: "SANS COMPTE.",
    needHelp: "AIDE?",
    returnToLogin: "LOGIN",
    todayMatches: "MATCHS",
    myTickets: "MES TICKETS",
    stake: "MISE",
    totalWinnings: "TOTAL",
    ok: "OK",
    comboElite: "ELITE",
    precisionAnalysis: "ANALYSE",
    totalOdds: "COTE",
    chat: "Chat",
    sendMessage: "Envoyer",
    typeMessage: "Message...",
    noMessages: "Pas de messages.",
    footerInfo: "ID pour tous les bookmakers !",
    profilePic: "Photo",
    addComment: "Commenter...",
    publicAccumulator: "FICHA PUBLIQUE",
    referralCode: "CODE (OPTIONNEL)",
    generateReferral: "GÉNÉRER CODE",
    referralTitle: "ZONE INVITE",
    referralInfo: "Invitez 20 amis = 4 jours VIP !",
    yourCode: "CODE:",
    totalInvites: "TOTAL:",
    inviteList: "LISTE:",
    noInvites: "Pas d'invités.",
    daysEarned: "JOURS VIP DISPONIBLES:",
    claimPrize: "RÉCUPÉRER VIP",
    claimSuccess: "PRIX RÉCUPÉRÉ!",
    minClaimMsg: "Minimum 20 invités!",
    unclaimedInvites: "INVITÉS NON RÉCLAMÉS:",
    copyCode: "COPIAR CODE",
    historico: "Historique",
    historicoVazio: "PAS ENCORE DE VICTOIRES",
    vitoriaIA: "VICTOIRE IA",
    resultadoGanho: "RÉSULTAT: GAGNÉ ✅",
    motto: "Ne pariez pas sur la chance... pariez sur la science !"
  },
  es: {
    promoTitle: "GANA CON LA ÉLITE",
    promoText: "ÚNETE A MILES DE GANADORES.",
    login: "ENTRAR",
    register: "REGISTRO",
    username: "USUARIO",
    password: "PASSWORD",
    phone: "TELÉFONO",
    province: "PROVINCIA",
    age: "EDAD",
    country: "PAÍS",
    enterNow: "ENTRAR",
    finishReg: "FINALIZAR",
    welcome: "BIENVENIDO",
    palpites: "Hoy",
    fichas: "Fichas",
    boletim: "Boleto",
    guardados: "Guardado",
    userNotFound: "NO EXISTE",
    wrongPass: "INCORRECTA",
    authError: "ERROR",
    accCreated: "CREADA!",
    welcomeBack: "HOLA!",
    saved: "GUARDADO!",
    vazio: "VACÍO",
    settings: "AJUSTES",
    theme: "TEMA",
    lang: "IDIOMA",
    logout: "SALIR",
    support: "SOPORTE",
    followUs: "SÍGUENOS",
    community: "COMUNIDAD",
    vipRestrictedTitle: "ACCESO VIP",
    vipRestrictedText: "FICHAS EXCLUSIVAS.",
    vipExpiredText: "VIP EXPIRADO.",
    talkToCeo: "HABLAR CEO",
    vipWhatsappMsg: "Hola, quiero comprar VIP.",
    tickerText: "🔥 ¡HAZTE VIP!",
    copySuccess: "COPIADO!",
    buyVip: "COMPRAR VIP",
    vipStatus: "USUARIO VIP",
    daysRemaining: "DÍAS RESTANTES",
    talkWithUs: "HABLAR",
    invalidPhone: "INVÁLIDO!",
    accountExists: "YA EXISTE!",
    stakeAmount: "APUESTA",
    potentialWinnings: "GANANCIA",
    vipOnlyContent: "CONTENIDO VIP",
    vipOnlyMatch: "MATCH VIP",
    bookieId: "ID CASA",
    copyId: "COPIAR ID",
    forgotPass: "OLVIDÉ?",
    newPassword: "NUEVA",
    confirmPassword: "REPETIR",
    verifyUser: "VERIFICAR",
    updatePass: "ACTUALIZAR",
    userFound: "ENCONTRADO:",
    passMismatch: "NO COINCIDEN!",
    passUpdated: "ACTUALIZADA!",
    createAccPrompt: "SIN CUENTA.",
    needHelp: "AYUDA?",
    returnToLogin: "LOGIN",
    todayMatches: "PARTIDOS",
    myTickets: "MIS BOLETOS",
    stake: "APUESTA",
    totalWinnings: "TOTAL",
    ok: "OK",
    comboElite: "ELITE",
    precisionAnalysis: "ANÁLISIS",
    totalOdds: "CUOTA",
    chat: "Chat",
    sendMessage: "Enviar",
    typeMessage: "Mensaje...",
    noMessages: "Sin mensajes.",
    footerInfo: "IDs para todas las casas !",
    profilePic: "Foto",
    addComment: "Comentar...",
    publicAccumulator: "FICHA PÚBLICA",
    referralCode: "CÓDIGO (OPCIONAL)",
    generateReferral: "GENERAR CÓDIGO",
    referralTitle: "INVITACIONES",
    referralInfo: "¡20 amigos = 4 días VIP!",
    yourCode: "CÓDIGO:",
    totalInvites: "TOTAL:",
    inviteList: "LISTA:",
    noInvites: "Sin invitaciones.",
    daysEarned: "DÍAS VIP DISPONÍVEIS:",
    claimPrize: "CANJEAR VIP",
    claimSuccess: "¡CANJEADO!",
    minClaimMsg: "¡Mínimo 20 invitados!",
    unclaimedInvites: "INVITADOS NO CANJEADOS:",
    copyCode: "COPIAR CÓDIGO",
    historico: "Historial",
    historicoVazio: "SIN REGISTROS DE VICTORIA",
    vitoriaIA: "VICTORIA IA",
    resultadoGanho: "RESULTADO: GANADO ✅",
    motto: "¡No apuestes por la suerte... apuestes por la ciencia!"
  }
};

const formatDateLong = (dateStr?: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2]);
  const month = parseInt(parts[1]);
  const year = parts[0];
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  return `${day} de ${months[month - 1]} de ${year}`;
};

const formatValueDisplay = (val: any) => {
  if (val === undefined || val === null) return "0";
  // Se for string vinda do banco, usa como está para preservar formatação (ex: 3.500 KZ)
  if (typeof val === 'string') return val;
  // Se for número, aplica formatação padrão
  const numericVal = parseFloat(String(val).replace(/[^\d.,]/g, '').replace(',', '.'));
  if (isNaN(numericVal)) return val.toString();
  return numericVal.toLocaleString('pt-AO').replace(',', '.') + " kz";
};

const formatCurrency = (val: number | string) => {
  if (val === undefined || val === null) return "0";
  const numericVal = typeof val === 'string' ? parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.')) : val;
  if (isNaN(numericVal)) return val.toString();
  return Math.floor(numericVal).toLocaleString('pt-AO').replace(',', '.');
};

const parseFormattedValue = (val: string | number | undefined | null): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  let str = String(val).toLowerCase().replace(/kz/gi, "").trim();
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      str = parts[0] + '.' + parts[1];
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length === 2) {
      if (parts[1].length === 3) {
        str = parts[0] + parts[1];
      } else {
        str = parts[0] + '.' + parts[1];
      }
    } else {
      str = str.replace(/\./g, '');
    }
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

const formatNumberWithDots = (num: number): string => {
  return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const AdSenseBanner = ({ isDarkMode, slot }: { isDarkMode: boolean; slot?: string }) => {
  React.useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense failed to load/render:", e);
    }
  }, []);

  return (
    <div className={isDarkMode ? "my-4 p-4 rounded-[1.8rem] border-4 flex flex-col items-center justify-center relative overflow-hidden shadow-md min-h-[90px] bg-zinc-900/40 border-zinc-800" : "my-4 p-4 rounded-[1.8rem] border-4 flex flex-col items-center justify-center relative overflow-hidden shadow-md min-h-[90px] bg-slate-50 border-slate-200"}>
      <span className="absolute top-1.5 right-3 text-[7px] font-black tracking-widest text-zinc-500 uppercase italic">Anúncio Google</span>
      <div className="w-full flex items-center justify-center min-h-[50px]">
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', minHeight: '50px' }}
             data-ad-client="ca-pub-8959686518292972"
             data-ad-slot={slot || "auto"}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
};

const getFirebaseKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const cleanSelectionText = (market: string, selection: string) => {
  if (!market || typeof market !== 'string') return selection || "";
  if (!selection || typeof selection !== 'string') return "";
  const marketWords = market.toLowerCase().split(/\s+/);
  const selectionWords = selection.toLowerCase().split(/\s+/);
  const keywords = ["golos", "gols", "cartões", "cantos", "escanteios", "vitoria", "vitoria", "empate"];
  let cleanedSelection = selection;
  keywords.forEach(kw => {
    if (marketWords.includes(kw) && selectionWords.includes(kw)) {
      const regex = new RegExp(`\\s*${kw}\\s*`, 'gi');
      cleanedSelection = cleanedSelection.replace(regex, ' ').trim();
    }
  });
  return cleanedSelection;
};

const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appConfig, setAppConfig] = useState({
    telegram: "https://t.me/DR_PALPITES",
    whatsapp: "https://chat.whatsapp.com/CUCKC54B70KB1mziO1QwRy?mode=gi_t",
    facebook: "https://www.facebook.com/profile.php?id=100083556525090",
    support: "+244942607599",
    logoUrl: "https://i.ibb.co/fYTYtmVp/IMG-20260714-WA0001-2.webp",
    loja: "https://fermagna.netlify.app/"
  });
  const [authMode, setAuthMode] = useState<"login" | "register" | "recovery">("login");
  const [recoveryStep, setRecoveryStep] = useState<"verify" | "reset">("verify");
  const [recoveredUser, setRecoveredUser] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState<Lang>('pt');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"hoje" | "acumulador" | "historico" | "boletim" | "guardados" | "chat">("hoje");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReferralPanelOpen, setIsReferralPanelOpen] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [ganhos, setGanhos] = useState<Ficha[]>([]);
  const [betSlip, setBetSlip] = useState<any[]>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [manualStake, setManualStake] = useState<string>("1000");
  const [activeAlert, setActiveAlert] = useState<AlertData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- AdSense Offerwall / Rewarded Video States ---
  const [normalModeUnlockedUntil, setNormalModeUnlockedUntil] = useState<number>(() => {
    return parseInt(localStorage.getItem("dr_normal_mode_unlocked_until") || "0", 10);
  });
  const [unlockedMatches, setUnlockedMatches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dr_unlocked_matches") || "[]");
    } catch {
      return [];
    }
  });

  // Ad player state machine
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adSecondsLeft, setAdSecondsLeft] = useState(5);
  const [adTargetType, setAdTargetType] = useState<"normal" | "match" | null>(null);
  const [adTargetMatchId, setAdTargetMatchId] = useState<string | null>(null);
  const [adComplete, setAdComplete] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adMuted, setAdMuted] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("dr_normal_mode_unlocked_until", String(normalModeUnlockedUntil));
  }, [normalModeUnlockedUntil]);

  useEffect(() => {
    localStorage.setItem("dr_unlocked_matches", JSON.stringify(unlockedMatches));
  }, [unlockedMatches]);

  const MOCK_ADS = [
    {
      title: "ELEPHANT BET ANGOLA",
      subtitle: "Bónus de Boas-Vindas de até 300%!",
      description: "Aposte nas melhores ligas com as maiores odds de Angola. Registe-se hoje mesmo e triplique o seu primeiro depósito para começar a ganhar prémios fantásticos!",
      cta: "Registar Agora",
      accentColor: "#f59e0b",
      bgGradient: "from-amber-600 to-amber-950"
    },
    {
      title: "PREMIER BET ANGOLA",
      subtitle: "A Maior Casa de Apostas de África",
      description: "Descubra a fantástica funcionalidade do 'Bolada Rápida' e receba os seus ganhos instantaneamente via Multicaixa Express. É simples, rápido e 100% seguro!",
      cta: "Apostar na Premier",
      accentColor: "#10b981",
      bgGradient: "from-emerald-600 to-emerald-950"
    },
    {
      title: "BANTUBET ANGOLA",
      subtitle: "Odds Gigantes e Cashout Completo",
      description: "Não espere o jogo terminar! Use o Cashout do BantuBet para garantir os seus lucros ou reduzir as suas perdas a qualquer momento da partida. Controle as suas apostas!",
      cta: "Entrar no BantuBet",
      accentColor: "#3b82f6",
      bgGradient: "from-blue-600 to-blue-950"
    }
  ];

  const startAdPlayback = (type: "normal" | "match", matchId?: string) => {
    setAdTargetType(type);
    setAdTargetMatchId(matchId || null);
    setIsAdPlaying(true);
    setAdSecondsLeft(5);
    setAdComplete(false);
    setCurrentAdIndex(Math.floor(Math.random() * MOCK_ADS.length));
  };

  useEffect(() => {
    let timer: any;
    if (isAdPlaying && adSecondsLeft > 0) {
      timer = setInterval(() => {
        setAdSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isAdPlaying && adSecondsLeft === 0) {
      setAdComplete(true);
    }
    return () => clearInterval(timer);
  }, [isAdPlaying, adSecondsLeft]);

  const handleClaimAdReward = () => {
    if (adTargetType === "normal") {
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      setNormalModeUnlockedUntil(expiry);
      addToast("Acesso completo desbloqueado por 24 horas!", "success");
    } else if (adTargetType === "match" && adTargetMatchId) {
      setUnlockedMatches(prev => {
        if (prev.includes(adTargetMatchId)) return prev;
        return [...prev, adTargetMatchId];
      });
      addToast("Palpite VIP desbloqueado com sucesso!", "success");
    }
    setIsAdPlaying(false);
    setAdComplete(false);
    setAdTargetType(null);
    setAdTargetMatchId(null);
  };

  const [formData, setFormData] = useState({
    username: "", country: "", customCountry: "", password: "", confirmPassword: "", phone: "", province: "", age: "", profilePic: "", referralCode: ""
  });

  const handleTextFormat = (val: string) => {
    if (!val) return "";
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  };

  const selectedCountryObj = useMemo(() => COUNTRY_DATA.find(c => c.name === formData.country), [formData.country]);
  const selectedCountryCode = useMemo(() => selectedCountryObj?.code || "", [selectedCountryObj]);
  
  const t = useCallback((key: keyof typeof TRANSLATIONS['pt']) => {
    const langObj = (TRANSLATIONS as any)[lang] || TRANSLATIONS['pt'];
    return langObj[key] || (TRANSLATIONS['pt'] as any)[key] || key;
  }, [lang]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 3000);
  }, []);

  const hasVipAccess = useMemo(() => {
    const isVip = user?.isVip === true;
    const isExpired = (user?.vipExpiry && user.vipExpiry > 0) ? Date.now() > user.vipExpiry : false;
    return isVip && !isExpired;
  }, [user]);

  const isNormalModeUnlocked = useMemo(() => {
    return hasVipAccess || (normalModeUnlockedUntil > Date.now());
  }, [hasVipAccess, normalModeUnlockedUntil]);

  const vipDaysRemaining = useMemo(() => {
    if (!user?.vipExpiry) return 0;
    return Math.max(0, Math.ceil((user.vipExpiry - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [user]);

  const unclaimedInvitesCount = useMemo(() => {
    if (!user) return 0;
    const total = referrals.length;
    const claimed = user.claimedInvites || 0;
    return Math.max(0, total - claimed);
  }, [user, referrals]);

  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const configRef = ref(db, "drpalpites/config");
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAppConfig(prev => ({
          telegram: data.telegram || prev.telegram,
          whatsapp: data.whatsapp || prev.whatsapp,
          facebook: data.facebook || prev.facebook,
          support: data.support || prev.support,
          logoUrl: data.logoUrl || prev.logoUrl,
          loja: data.loja || prev.loja
        }));
      } else {
        set(configRef, {
          telegram: "https://t.me/DR_PALPITES",
          whatsapp: "https://chat.whatsapp.com/CUCKC54B70KB1mziO1QwRy?mode=gi_t",
          facebook: "https://www.facebook.com/profile.php?id=100083556525090",
          support: "+244942607599",
          logoUrl: "https://i.ibb.co/fYTYtmVp/IMG-20260714-WA0001-2.webp",
          loja: "https://fermagna.netlify.app/"
        }).catch(err => console.error("Error setting initial config:", err));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const alertRef = ref(db, "Alerta/chave");
    const unsubscribe = onValue(alertRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as AlertData;
        if (data && String(data.mostrar) === "true") {
          const dismissedToken = localStorage.getItem("dr_dismissed_alert");
          if (!data.token || dismissedToken !== data.token) {
            setActiveAlert(data);
          }
        } else {
          setActiveAlert(null);
        }
      } else {
        setActiveAlert(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUserStr = localStorage.getItem("dr_user");
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr) as UserProfile;
          if (parsed && parsed.uid) {
            const userRef = ref(db, `usuarios/${parsed.uid}`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
              const userData = snapshot.val() as UserProfile;
              setUser(userData);
              localStorage.setItem("dr_user", JSON.stringify(userData));
            } else {
              setUser(null);
              localStorage.removeItem("dr_user");
            }
          } else {
            setUser(null);
            localStorage.removeItem("dr_user");
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
        setUser(null);
      } finally {
        setIsAuthReady(true);
        setIsAuthenticating(false);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem("dr_lang") as Lang;
    if (savedLang) setLang(savedLang);
    const savedTheme = localStorage.getItem("dr_theme");
    if (savedTheme) setIsDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    if (user && isAuthReady) {
      loadFirebaseData();
      const stored = localStorage.getItem(`dr_tickets_${user.uid || user.username}`);
      if (stored) setSavedTickets(JSON.parse(stored));
      loadReferrals();
    }
  }, [user, isAuthReady]);

  useEffect(() => {
    if (activeTab === 'chat' && isAuthReady) {
      const chatRef = ref(db, "chat");
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const msgs = Object.keys(data).map(key => ({ ...data[key], id: key } as ChatMessage));
          setChatMessages(msgs.sort((a, b) => a.timestamp - b.timestamp).slice(-50));
        } else {
          setChatMessages([]);
        }
      });
      return () => unsubscribe();
    }
  }, [activeTab, isAuthReady]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadChat = async () => {
    // Carregado via onValue no useEffect
  };

  const loadReferrals = async () => {
    if (!user) return;
    try {
      const referralsRef = ref(db, `usuarios/${user.uid}/referrals`);
      const snapshot = await get(referralsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const refs = Object.values(data) as Referral[];
        setReferrals(refs);
      } else {
        setReferrals([]);
      }
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
    }
  };

  const generateReferralCode = async () => {
    if (!user) return;
    const code = (user.username.substring(0, 4) + Math.random().toString(36).substring(2, 6)).toUpperCase();
    try {
      await update(ref(db, `usuarios/${user.uid}`), { referralCode: code });
      const updated = { ...user, referralCode: code };
      setUser(updated);
      localStorage.setItem("dr_user", JSON.stringify(updated));
      addToast(t('copySuccess'));
    } catch (error) {
      console.error("Erro ao gerar código:", error);
    }
  };

  const handleClaimVip = async () => {
    if (!user || unclaimedInvitesCount < 20) {
      addToast(t('minClaimMsg'), "error");
      return;
    }
    setLoading(true);
    try {
      const batches = Math.floor(unclaimedInvitesCount / 10);
      const days = batches * 2;
      const invitesToClaim = batches * 10;
      const currentExpiry = user.vipExpiry && user.vipExpiry > Date.now() ? user.vipExpiry : Date.now();
      const newExpiry = currentExpiry + (days * 24 * 60 * 60 * 1000);
      const newClaimed = (user.claimedInvites || 0) + invitesToClaim;

      await update(ref(db, `usuarios/${user.uid}`), { 
        isVip: true, 
        vipExpiry: newExpiry, 
        claimedInvites: newClaimed 
      });

      const updated = { ...user, isVip: true, vipExpiry: newExpiry, claimedInvites: newClaimed };
      setUser(updated);
      localStorage.setItem("dr_user", JSON.stringify(updated));
      addToast(t('claimSuccess'));
    } catch (error) {
      console.error("Erro ao resgatar VIP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user) return;
    const msg: Partial<ChatMessage> = {
      uid: user.uid,
      username: user.username,
      text: chatInput,
      timestamp: Date.now(),
      profilePic: user.profilePic
    };
    setChatInput("");
    try {
      await push(ref(db, "chat"), msg);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const loadFirebaseData = async () => {
    setLoading(true);
    const todayKey = getFirebaseKey();
    try {
      const [predictionsSnap, ganhosSnap] = await Promise.all([
        get(ref(db, "predictions")),
        get(ref(db, "Ganhos"))
      ]);

      let selectedDateKey = todayKey;
      const predictions = predictionsSnap.exists() ? predictionsSnap.val() : {};

      const todayHasMatches = predictions[todayKey] && predictions[todayKey].matches && Object.keys(predictions[todayKey].matches).length > 0;

      if (!todayHasMatches) {
        // Find previous dates that have matches, sorted from newest to oldest
        const allKeys = Object.keys(predictions).sort((a, b) => b.localeCompare(a));
        const fallbackKey = allKeys.find(key => {
          const hasMatches = predictions[key] && predictions[key].matches && Object.keys(predictions[key].matches).length > 0;
          return hasMatches && key.localeCompare(todayKey) <= 0;
        });

        if (fallbackKey) {
          selectedDateKey = fallbackKey;
        } else {
          // Fallback to any latest date in the entire predictions node that has matches if no past matches exist
          const anyValidKey = allKeys.find(key => {
            return predictions[key] && predictions[key].matches && Object.keys(predictions[key].matches).length > 0;
          });
          if (anyValidKey) {
            selectedDateKey = anyValidKey;
          }
        }
      }

      const dateData = predictions[selectedDateKey] || {};
      const aggregatedMatches = dateData.matches ? Object.values(dateData.matches) as Match[] : [];
      const accList = dateData.accumulators ? Object.values(dateData.accumulators) as Ficha[] : [];
      const fichasList = dateData.fichas ? Object.values(dateData.fichas) as Ficha[] : [];
      
      const combinedFichas: Ficha[] = [];
      const seenIds = new Set<string>();
      
      for (const item of [...accList, ...fichasList]) {
        if (item) {
          const identifier = item.id || item.createdAt?.toString() || JSON.stringify(item);
          if (!seenIds.has(identifier)) {
            seenIds.add(identifier);
            combinedFichas.push(item);
          }
        }
      }

      const finalizedGanhos = ganhosSnap.exists() ? Object.values(ganhosSnap.val()) as Ficha[] : [];

      setMatches(aggregatedMatches);
      setFichas(combinedFichas);
      setGanhos(finalizedGanhos.sort((a: any, b: any) => (b.date || 0) > (a.date || 0) ? 1 : -1));
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, profilePic: base64 }));
        if (user) {
          const updated = { ...user, profilePic: base64 };
          setUser(updated);
          localStorage.setItem("dr_user", JSON.stringify(updated));
          try {
            await update(ref(db, `usuarios/${user.uid}`), { profilePic: base64 });
          } catch (error) {
            console.error("Erro ao atualizar foto:", error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === "register") {
        const finalPhone = `${selectedCountryCode} ${formData.phone}`.trim();
        
        // Validação de telefone
        if (selectedCountryObj) {
          if (formData.phone.length < selectedCountryObj.min || formData.phone.length > selectedCountryObj.max) {
             addToast(t('invalidPhone'), "error");
             setLoading(false);
             return;
          }
        }

        // Verificar se telefone ou usuário já existe
        const usersRef = ref(db, "usuarios");
        const usersSnap = await get(usersRef);
        if (usersSnap.exists()) {
          const allUsers = Object.values(usersSnap.val()) as UserProfile[];
          const usernameClean = formData.username.trim();
          if (allUsers.some(u => u.username && u.username.trim() === usernameClean)) {
            addToast("Nome de usuário já está em uso!", "error");
            setLoading(false);
            return;
          }
          if (allUsers.some(u => u.phone === finalPhone)) {
            addToast(t('accountExists'), "error");
            setLoading(false);
            return;
          }
        }

        // Criar conta gerando um ID único
        const uid = "usr_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

        let invitedByUid = "";
        if (formData.referralCode && usersSnap.exists()) {
          const allUsers = Object.entries(usersSnap.val());
          const inviter = allUsers.find(([id, u]: [string, any]) => u.referralCode === formData.referralCode.toUpperCase());
          if (inviter) {
            invitedByUid = inviter[0];
          }
        }

        const newUser: UserProfile = { 
          uid, 
          username: formData.username, 
          country: formData.country === "OUTRO" ? formData.customCountry : formData.country, 
          phone: finalPhone, 
          province: formData.province, 
          age: formData.age, 
          isVip: false, 
          vipExpiry: 0, 
          profilePic: formData.profilePic, 
          invitedBy: invitedByUid, 
          claimedInvites: 0,
          password: formData.password
        };
        
        await set(ref(db, `usuarios/${uid}`), newUser);

        if (invitedByUid) {
          const refData: Referral = { uid, username: newUser.username, timestamp: Date.now() };
          await set(ref(db, `usuarios/${invitedByUid}/referrals/${uid}`), refData);
        }

        setUser(newUser); 
        localStorage.setItem("dr_user", JSON.stringify(newUser));
        addToast(t('accCreated'));
      } else if (authMode === "login") {
        // Login com Banco de Dados
        try {
          const usersRef = ref(db, "usuarios");
          const usersSnap = await get(usersRef);
          if (usersSnap.exists()) {
            const allUsers = Object.values(usersSnap.val()) as UserProfile[];
            const usernameClean = formData.username.trim();
            const foundUser = allUsers.find(u => 
              u.username && u.username.trim() === usernameClean && u.password === formData.password
            );

            if (foundUser) {
              setUser(foundUser); 
              localStorage.setItem("dr_user", JSON.stringify(foundUser));
              addToast(t('welcomeBack'));
            } else {
              addToast(t('wrongPass'), "error");
            }
          } else {
            addToast(t('userNotFound'), "error");
          }
        } catch (error: any) {
          addToast(t('authError'), "error");
        }
      }
    } catch (error) { 
      console.error(error);
      addToast(t('authError'), "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalPhone = `${selectedCountryCode} ${formData.phone}`.trim();
      if (recoveryStep === "verify") {
        const usersSnap = await get(ref(db, "usuarios"));
        if (usersSnap.exists()) {
          const allUsers = Object.values(usersSnap.val()) as UserProfile[];
          const u = allUsers.find(u => 
            u.phone === finalPhone && 
            u.country === formData.country && 
            u.province === formData.province
          );
          if (u) {
            setRecoveredUser(u);
            setRecoveryStep("reset");
            addToast(t('userFound') + " " + u.username);
          } else {
            addToast(t('createAccPrompt'), "error");
          }
        } else {
          addToast(t('createAccPrompt'), "error");
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          addToast(t('passMismatch'), "error");
          setLoading(false);
          return;
        }
        if (recoveredUser) {
          await update(ref(db, `usuarios/${recoveredUser.uid}`), { password: formData.password });
          addToast(t('passUpdated'));
          setAuthMode("login");
          setRecoveryStep("verify");
          setRecoveredUser(null);
          setFormData({ ...formData, password: "", confirmPassword: "" });
        }
      }
    } catch (error) {
      addToast(t('authError'), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTip = (match: Match, tip: any) => {
    const tipId = `${match.homeTeam}-${match.awayTeam}-${tip.market}-${tip.selection}`;
    const matchId = `${match.homeTeam} vs ${match.awayTeam}`;
    
    setBetSlip(prev => {
      const alreadySelected = prev.some(s => s.id === tipId);
      if (alreadySelected) {
        return prev.filter(s => s.id !== tipId);
      } else {
        return [...prev, { ...tip, id: tipId, matchName: matchId }];
      }
    });
  };

  const totalBetSlipOdds = useMemo(() => {
    return betSlip.reduce((acc, curr) => acc * curr.odds, 1);
  }, [betSlip]);

  const potentialWinningsCalculation = useMemo(() => {
    const total = parseFloat(manualStake || "0") * totalBetSlipOdds;
    return formatCurrency(total);
  }, [manualStake, totalBetSlipOdds]);

  const groupedBetSlip = useMemo(() => {
    return betSlip.reduce((acc: any, curr) => {
      if (!acc[curr.matchName]) acc[curr.matchName] = [];
      acc[curr.matchName].push(curr);
      return acc;
    }, {});
  }, [betSlip]);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      addToast(t('copySuccess'));
    });
  };

  const ageOptions = useMemo(() => {
    const opts = [];
    for(let i=17; i<=60; i++) opts.push(i);
    return opts;
  }, []);

  const handleLogout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("dr_user");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  if (isAuthenticating || !isAuthReady) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <RefreshCw className="animate-spin text-amber-500" size={40} />
    </div>
  );

  if (!user) {
    return (
      <div className={isDarkMode ? "min-h-screen bg-[#020617] text-white flex flex-col p-6 items-center justify-center transition-all overflow-y-auto" : "min-h-screen bg-white text-slate-900 flex flex-col p-6 items-center justify-center transition-all overflow-y-auto"}>
        <div className="absolute top-6 right-6 flex gap-3">
          <button onClick={() => {
             const langs: Lang[] = ['pt', 'en', 'fr', 'es'];
             const next = langs[(langs.indexOf(lang) + 1) % langs.length];
             setLang(next);
             localStorage.setItem("dr_lang", next);
          }} className="p-3 rounded-full border-2 border-amber-500/20 bg-amber-500/5 text-amber-500 shadow-xl active:scale-90 transition-all flex items-center gap-2">
            <Globe size={20} />
            <span className="text-[10px] font-black uppercase">{lang}</span>
          </button>
          <button onClick={() => { setIsDarkMode(!isDarkMode); localStorage.setItem("dr_theme", !isDarkMode ? "dark" : "light"); }} className="p-3 rounded-full border-2 border-amber-500/20 bg-amber-500/5 text-amber-500 shadow-xl active:scale-90 transition-all">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="w-full max-w-md space-y-5 py-5 animate-in">
          <div className="text-center space-y-2">
             <div className="w-16 h-16 rounded-[1.8rem] mx-auto overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.25)] border-2 border-amber-500 flex items-center justify-center bg-zinc-950">
               <img src={appConfig.logoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.ibb.co/fYTYtmVp/IMG-20260714-WA0001-2.webp'; }} />
             </div>
             <h1 className={isDarkMode ? "text-2xl font-black uppercase italic tracking-tighter text-white" : "text-2xl font-black uppercase italic tracking-tighter text-slate-900"}>DR <span className="text-amber-500">PALPITES</span></h1>
             <div className="space-y-1">
                <h2 className="text-amber-500 font-black italic text-lg tracking-tight leading-none">{t('promoTitle')}</h2>
                <p className={isDarkMode ? "text-[10px] font-black uppercase tracking-wider text-white leading-relaxed px-2 opacity-90" : "text-[10px] font-black uppercase tracking-wider text-slate-600 leading-relaxed px-2 opacity-90"}>
                  {t('promoText')}
                </p>
             </div>
          </div>

          <div className={isDarkMode ? "p-6 rounded-[2.2rem] border-4 bg-zinc-900/80 border-zinc-800 shadow-2xl backdrop-blur-xl" : "p-6 rounded-[2.2rem] border-4 bg-slate-50 border-slate-200 shadow-2xl backdrop-blur-xl"}>
            {authMode !== "recovery" ? (
              <>
                <div className={isDarkMode ? "flex gap-3 border-b pb-3 mb-5 border-zinc-800" : "flex gap-3 border-b pb-3 mb-5 border-slate-200"}>
                  <button onClick={() => setAuthMode("login")} className={`flex-1 text-[11px] font-black uppercase italic transition-all ${authMode === "login" ? "text-amber-500" : (isDarkMode ? "text-zinc-600" : "text-slate-400")}`}>{t('login')}</button>
                  <button onClick={() => setAuthMode("register")} className={`flex-1 text-[11px] font-black uppercase italic transition-all ${authMode === "register" ? "text-amber-500" : (isDarkMode ? "text-zinc-600" : "text-slate-400")}`}>{t('register')}</button>
                </div>

                <form onSubmit={handleAuth} className="space-y-3">
                  {authMode === "register" && (
                    <div className="flex flex-col items-center mb-4">
                      <div className="relative group">
                        <div className={isDarkMode ? "w-20 h-20 rounded-full border-4 border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center" : "w-20 h-20 rounded-full border-4 border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center"}>
                          {formData.profilePic ? (
                            <img src={formData.profilePic} className="w-full h-full object-cover" />
                          ) : (
                            <User size={36} className={isDarkMode ? "text-zinc-600" : "text-slate-400"} />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-amber-500 p-2 rounded-full cursor-pointer shadow-lg active:scale-90 transition-all">
                          <Camera size={14} className="text-black" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                        </label>
                      </div>
                      <span className="text-[9px] font-black text-amber-500 uppercase mt-2">{t('profilePic')}</span>
                    </div>
                  )}

                  <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300"}>
                    <User size={16} className="text-amber-500 shrink-0" />
                    <input required type="text" placeholder={t('username')} className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black text-white placeholder-zinc-500" : "bg-transparent outline-none w-full text-[10px] font-black text-slate-900 placeholder-zinc-500"} value={formData.username} onChange={e => setFormData({...formData, username: handleTextFormat(e.target.value)})} />
                  </div>

                  <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800 relative" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300 relative"}>
                    <Lock size={16} className="text-amber-500 shrink-0" />
                    <input required type={showPassword ? "text" : "password"} placeholder={t('password')} className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black uppercase text-white placeholder-zinc-500 pr-10" : "bg-transparent outline-none w-full text-[10px] font-black uppercase text-slate-900 placeholder-zinc-500 pr-10"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-zinc-600">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                  </div>

                  {authMode === "register" && (
                    <>
                      <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300"}>
                        <Flag size={16} className="text-amber-500 shrink-0" />
                        <select required className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black uppercase text-white cursor-pointer" : "bg-transparent outline-none w-full text-[10px] font-black uppercase text-slate-900 cursor-pointer"} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, phone: "", province: ""})}>
                          <option value="" disabled className="text-zinc-500">{t('country').toUpperCase()}</option>
                          {COUNTRY_DATA.map(c => <option key={c.name} value={c.name} className={isDarkMode ? "bg-black text-white" : "bg-white text-slate-900"}>{c.flag} {c.name}</option>)}
                        </select>
                      </div>

                      <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300"}>
                        <Phone size={16} className="text-amber-500 shrink-0" />
                        <div className="flex items-center gap-2 w-full">
                          {selectedCountryCode && <span className="text-[10px] font-black text-amber-500">{selectedCountryCode}</span>}
                          <input required type="tel" placeholder={t('phone').toUpperCase()} className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black uppercase text-white placeholder-zinc-500" : "bg-transparent outline-none w-full text-[10px] font-black uppercase text-slate-900 placeholder-zinc-500"} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800 overflow-hidden" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300 overflow-hidden"}>
                          <MapPin size={16} className="text-amber-500 shrink-0" />
                          {selectedCountryObj && selectedCountryObj.provinces.length > 0 ? (
                            <select required className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black text-white cursor-pointer truncate" : "bg-transparent outline-none w-full text-[10px] font-black text-slate-900 cursor-pointer truncate"} value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}>
                              <option value="" disabled className="text-zinc-500">{t('province').toUpperCase()}</option>
                              {selectedCountryObj.provinces.map(p => <option key={p} value={p} className={isDarkMode ? "bg-black text-white" : "bg-white text-slate-900"}>{p}</option>)}
                            </select>
                          ) : (
                            <input required type="text" placeholder={t('province').toUpperCase()} className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black text-white placeholder-zinc-500" : "bg-transparent outline-none w-full text-[10px] font-black text-slate-900 placeholder-zinc-500"} value={formData.province} onChange={e => setFormData({...formData, province: handleTextFormat(e.target.value)})} />
                          )}
                        </div>
                        <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300"}>
                          <Calendar size={16} className="text-amber-500 shrink-0" />
                          <select required className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black uppercase text-white cursor-pointer" : "bg-transparent outline-none w-full text-[10px] font-black uppercase text-slate-900 cursor-pointer"} value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})}>
                            <option value="" disabled className="text-zinc-500">{t('age').toUpperCase()}</option>
                            {ageOptions.map(a => <option key={a} value={a} className={isDarkMode ? "bg-black text-white" : "bg-white text-slate-900"}>{a}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300"}>
                        <UserPlus size={16} className="text-amber-500 shrink-0" />
                        <input type="text" placeholder={t('referralCode')} className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black uppercase text-white placeholder-zinc-500" : "bg-transparent outline-none w-full text-[10px] font-black uppercase text-slate-900 placeholder-zinc-500"} value={formData.referralCode} onChange={e => setFormData({...formData, referralCode: e.target.value.toUpperCase()})} />
                      </div>
                    </>
                  )}

                  <button disabled={loading} className="w-full bg-amber-500 text-black font-black py-4 rounded-[1.2rem] text-[10px] uppercase italic flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-[0_12px_25px_rgba(245,158,11,0.35)] active:scale-95 mt-2">
                    {loading ? <RefreshCw className="animate-spin" /> : (authMode === "login" ? t('enterNow') : t('finishReg'))}
                  </button>
                </form>

                {authMode === "login" && (
                  <button onClick={() => setAuthMode("recovery")} className={isDarkMode ? "w-full mt-4 text-[9px] font-black uppercase italic tracking-widest text-zinc-500" : "w-full mt-4 text-[9px] font-black uppercase italic tracking-widest text-slate-400"}>
                    {t('forgotPass')}
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-4 animate-in">
                <button onClick={() => { setAuthMode("login"); setRecoveryStep("verify"); }} className={isDarkMode ? "flex items-center gap-2 text-[9px] font-black uppercase italic text-amber-500" : "flex items-center gap-2 text-[9px] font-black uppercase italic text-amber-600"}>
                   <ChevronLeft size={14} /> {t('returnToLogin')}
                </button>
                <h3 className="text-sm font-black italic uppercase text-amber-500 tracking-tighter leading-none border-b-2 border-amber-500/20 pb-2">
                   {recoveryStep === "verify" ? t('verifyUser') : t('updatePass')}
                </h3>
                <form onSubmit={handleRecovery} className="space-y-3">
                  {recoveryStep === "verify" ? (
                    <>
                      <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300"}>
                        <Flag size={16} className="text-amber-500 shrink-0" />
                        <select required className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black uppercase text-white cursor-pointer" : "bg-transparent outline-none w-full text-[10px] font-black uppercase text-slate-900 cursor-pointer"} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, phone: "", province: ""})}>
                          <option value="" disabled className="text-zinc-500">{t('country').toUpperCase()}</option>
                          {COUNTRY_DATA.map(c => <option key={c.name} value={c.name} className={isDarkMode ? "bg-black text-white" : "bg-white text-slate-900"}>{c.flag} {c.name}</option>)}
                        </select>
                      </div>
                      <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300"}>
                        <MapPin size={16} className="text-amber-500 shrink-0" />
                        {selectedCountryObj && selectedCountryObj.provinces.length > 0 ? (
                          <select required className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black text-white cursor-pointer truncate" : "bg-transparent outline-none w-full text-[10px] font-black text-slate-900 cursor-pointer truncate"} value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}>
                            <option value="" disabled className="text-zinc-500">{t('province').toUpperCase()}</option>
                            {selectedCountryObj.provinces.map(p => <option key={p} value={p} className={isDarkMode ? "bg-black text-white" : "bg-white text-slate-900"}>{p}</option>)}
                          </select>
                        ) : (
                          <input required type="text" placeholder={t('province').toUpperCase()} className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black text-white placeholder-zinc-500" : "bg-transparent outline-none w-full text-[10px] font-black text-slate-900 placeholder-zinc-500"} value={formData.province} onChange={e => setFormData({...formData, province: handleTextFormat(e.target.value)})} />
                        )}
                      </div>
                      <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300"}>
                        <Phone size={16} className="text-amber-500 shrink-0" />
                        <div className="flex items-center gap-2 w-full">
                          {selectedCountryCode && <span className="text-[10px] font-black text-amber-500">{selectedCountryCode}</span>}
                          <input required type="tel" placeholder={t('phone').toUpperCase()} className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black uppercase text-white placeholder-zinc-500" : "bg-transparent outline-none w-full text-[10px] font-black uppercase text-slate-900 placeholder-zinc-500"} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={isDarkMode ? "p-4 rounded-[1rem] border-2 border-amber-500/20 bg-amber-500/5 text-white" : "p-4 rounded-[1rem] border-2 border-amber-500/20 bg-amber-50 text-slate-900"}>
                         <span className="text-[9px] font-black uppercase text-amber-500/60 block mb-1">{t('userFound')}</span>
                         <span className="text-[12px] font-black">{recoveredUser?.username}</span>
                      </div>
                      <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800 relative" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300 relative"}>
                        <Lock size={16} className="text-amber-500 shrink-0" />
                        <input required type={showPassword ? "text" : "password"} placeholder={t('newPassword')} className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black uppercase text-white placeholder-zinc-500 pr-10" : "bg-transparent outline-none w-full text-[10px] font-black uppercase text-slate-900 placeholder-zinc-500 pr-10"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                      </div>
                      <div className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-black border-zinc-800 relative" : "flex items-center gap-3 p-3.5 rounded-[1.2rem] border-2 bg-white border-slate-300 relative"}>
                        <Lock size={16} className="text-amber-500 shrink-0" />
                        <input required type={showPassword ? "text" : "password"} placeholder={t('confirmPassword')} className={isDarkMode ? "bg-transparent outline-none w-full text-[10px] font-black uppercase text-white placeholder-zinc-500 pr-10" : "bg-transparent outline-none w-full text-[10px] font-black uppercase text-slate-900 placeholder-zinc-500 pr-10"} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-zinc-600">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                      </div>
                    </>
                  )}
                  <button disabled={loading} className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl text-[10px] uppercase italic flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl active:scale-95 mt-2">
                    {loading ? <RefreshCw className="animate-spin" /> : (recoveryStep === "verify" ? t('verifyUser') : t('updatePass'))}
                  </button>
                </form>
              </div>
            )}

            {/* PDF Technical Documentation Button */}
            <div className="mt-5 pt-4 border-t border-zinc-800/60">
              <button 
                type="button"
                onClick={() => setShowDocModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[1.2rem] bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-2 border-amber-500/40 text-amber-500 font-black text-[10px] uppercase italic tracking-wider hover:bg-amber-500/30 active:scale-95 transition-all shadow-lg"
              >
                <BookOpen size={16} className="text-amber-500 shrink-0" />
                <span className="truncate">📘 DOCUMENTAÇÃO TÉCNICA / MANUAL (PDF)</span>
                <Download size={14} className="text-amber-500 shrink-0" />
              </button>
            </div>

            <div className="mt-8 border-t-2 border-zinc-500/10 pt-6 flex flex-col items-center gap-5">
              <a href={`https://wa.me/${appConfig.support}`} target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase italic text-amber-500 bg-amber-500/5 px-4 py-2 rounded-full border border-amber-500/20 shadow-lg active:scale-95 transition-all">
                <HelpCircle size={16} /> {t('needHelp')}
              </a>
              <div className="flex gap-8 items-center">
                <a href={appConfig.facebook} target="_blank" className="text-blue-600 active:scale-90 transition-all"><Facebook size={26} /></a>
                <a href={appConfig.telegram} target="_blank" className="text-sky-500 active:scale-90 transition-all"><Send size={26} /></a>
                <a href={`https://wa.me/${appConfig.support}`} target="_blank" className="text-emerald-500 active:scale-90 transition-all"><MessageCircle size={26} /></a>
              </div>
              <span className="text-[8px] font-black text-zinc-500/60 tracking-[0.2em] uppercase italic">{t('support').toUpperCase()}: {appConfig.support}</span>
            </div>
          </div>
        </div>

        {/* DOCUMENTATION & AUDIT PDF MODAL */}
        {showDocModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in">
            <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-[2rem] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase italic tracking-wider text-amber-500">Documentação Técnica & Manual</h3>
                    <p className="text-[9px] text-zinc-400 font-semibold">Dr. PALPITES / TECNO-Trader — Engenharia & IA</p>
                  </div>
                </div>
                <button onClick={() => setShowDocModal(false)} className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body / Printable Content */}
              <div id="printable-doc" className="p-6 overflow-y-auto space-y-8 text-[11px] leading-relaxed text-zinc-300">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] flex items-center justify-between no-print">
                  <div>
                    <span className="font-black block uppercase">📘 E-BOOK MASTER: COMO CRIAR APPS COM INTELIGÊNCIA ARTIFICIAL (EDIÇÃO COMPLETA)</span>
                    <span className="text-[9px] opacity-80">Guia Definitivo Consolidado • Sem marcas de água • Fundo Escuro Oficial • Pronto para Salvar em PDF</span>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-black font-black uppercase text-[10px] rounded-lg shadow-lg hover:bg-amber-400 active:scale-95 transition-all"
                  >
                    <Download size={14} /> Salvar PDF Oficial
                  </button>
                </div>

                {/* CAPA OFICIAL (SLIDE 1 & 2) */}
                <div className="page-card text-center p-8 rounded-3xl bg-zinc-900/90 border-2 border-amber-500/40 space-y-4">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black tracking-widest uppercase">
                    GUIA COMPLETO • SEM CÓDIGO • COM INTELIGÊNCIA ARTIFICIAL
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight">
                    COMO CRIAR APPS COM <span className="text-amber-500">INTELIGÊNCIA ARTIFICIAL</span>
                  </h1>
                  <p className="text-xs text-zinc-300 max-w-xl mx-auto leading-relaxed">
                    Nos dias de hoje, a tecnologia está a transformar radicalmente todos os sectores da nossa vida. Qualquer pessoa — mesmo sem qualquer conhecimento prévio de programação — pode agora criar aplicativos impressionantes com apenas uma ideia e algumas palavras. Bem-vindo ao futuro do desenvolvimento de software.
                  </p>
                  <div className="pt-2 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                    Edição Master Oficial • Caso Real: Dr. PALPITES (Motor Tecno-Trader)
                  </div>
                </div>

                {/* ÍNDICE COMPLETO (SLIDE 3) */}
                <div className="page-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide border-b border-zinc-800 pb-2">
                    📑 ÍNDICE: A JORNADA COMPLETA
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px]">
                    <div className="space-y-1.5">
                      <p className="text-amber-400 font-black uppercase">01. PARTE I — O COMEÇO & A REVOLUÇÃO</p>
                      <ul className="list-disc pl-4 text-zinc-400 space-y-0.5">
                        <li>Como Criar Apps com IA</li>
                        <li>A Revolução da IA em Todos os Sectores</li>
                        <li>A Minha História: Como Aprendi a Programar aos 19 Anos</li>
                        <li>Qualidades que Todo Dev com IA Deve Ter</li>
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-amber-400 font-black uppercase">02. PARTE II — ENTENDENDO AS FERRAMENTAS</p>
                      <ul className="list-disc pl-4 text-zinc-400 space-y-0.5">
                        <li>Google AI Studio (Recomendado) vs Lovable vs Replit</li>
                        <li>Por que o Google AI Studio é Superior</li>
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-amber-400 font-black uppercase">03. PARTE III — DOMINANDO OS PROMPTS</p>
                      <ul className="list-disc pl-4 text-zinc-400 space-y-0.5">
                        <li>A Arte do Prompt Perfeito & Anatomia de 14 Elementos</li>
                        <li>O Prompt Mestre: Template Profissional de 18 Seções</li>
                        <li>Do Pensamento para a Aplicação (O Guia Passo a Passo)</li>
                        <li>A Primeira Geração: Analisando Resultados com Olhar Crítico</li>
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-amber-400 font-black uppercase">04. PARTE IV — CONSTRUÇÃO, BANCO & DEPLOY</p>
                      <ul className="list-disc pl-4 text-zinc-400 space-y-0.5">
                        <li>Firebase: Backend em Tempo Real (Como Criar Passo a Passo)</li>
                        <li>GitHub: Versionamento Seguro & Conexão no AI Studio</li>
                        <li>Netlify & Vercel: Hospedagem Profissional & O Segredo do _redirects</li>
                        <li>UI/UX de Luxo: Eliminando Textos Técnicos & Modo Escuro/Claro</li>
                      </ul>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <p className="text-amber-400 font-black uppercase">05. PARTE V & VI — MONETIZAÇÃO & PROJETO REAL (MÉTODO TECNO)</p>
                      <ul className="list-disc pl-4 text-zinc-400 space-y-0.5">
                        <li>Google AdSense: Script Oficial, Arquivo ads.txt & Offerwall 24 Horas</li>
                        <li>Projeto Completo: Da Ideia à Publicação & Checklist Final</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* HISTÓRIA E MENTALIDADE (SLIDE 4 & 5) */}
                <div className="page-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide border-b border-zinc-800 pb-2">
                    📖 A MINHA HISTÓRIA & AS QUALIDADES QUE TODO DEV DEVE TER
                  </h2>
                  <p className="text-zinc-300">
                    É engraçado a maneira como me tornei um Dev. Foi em <strong>Novembro de 2024, com apenas 19 anos</strong>. Eu não sabia o que queria fazer da vida. De repente, fui adicionado a um grupo de vendas de bot do Aviator. O administrador era programador e tinha o seu próprio aplicativo. Pensei: <em>"Não quero apenas ter acesso àquele bot como jogador — quero criar o meu próprio aplicativo."</em> Nem fazia ideia de como funcionava, nem sequer sabia se era possível fazer isso pelo celular.
                  </p>
                  <p className="text-zinc-300">
                    Comecei a conversar com o ChatGPT e perguntei: <em>"Como posso instalar?"</em>. A resposta foi simples: <em>"Baixa o aplicativo HTML Editor."</em> Segui cada passo com atenção. Aquele primeiro protótipo, mesmo simples, foi o ponto de viragem. Percebi que não precisava de anos de estudo universitário para criar algo real: precisava de uma ideia clara, de uma ferramenta de IA e de persistência diária.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <strong className="text-amber-400 block text-xs">1. Paciência</strong>
                      <span className="text-[10px] text-zinc-400">Água mole em pedra dura tanto bate até que fura. A IA nem sempre acerta de primeira — a persistência é o que separa quem vence de quem desiste.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <strong className="text-amber-400 block text-xs">2. Foco e Fé</strong>
                      <span className="text-[10px] text-zinc-400">Quando dizes "eu vou conseguir", fazes o impossível tornar-se real. O foco mantém-te no caminho quando surgem erros.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <strong className="text-amber-400 block text-xs">3. Humildade Tecnológica</strong>
                      <span className="text-[10px] text-zinc-400">Cada explicação da IA é uma aula sumariada. Pergunta sempre "por quê?" e "como funciona?", substituindo o tempo perdido no TikTok pelo estudo prático.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <strong className="text-amber-400 block text-xs">4. Disposição</strong>
                      <span className="text-[10px] text-zinc-400">"Enquanto eu não conseguir, não vou parar." Seja em casa, na escola ou no transporte, qualquer momento é oportunidade de criar.</span>
                    </div>
                  </div>
                </div>

                {/* REVOLUÇÃO & FERRAMENTAS (SLIDE 6 & 7) */}
                <div className="page-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide border-b border-zinc-800 pb-2">
                    ⚡ A REVOLUÇÃO DA IA & POR QUE O GOOGLE AI STUDIO É A ESCOLHA NÚMERO 1
                  </h2>
                  <p className="text-zinc-300">
                    A IA redefiniu a comunicação, o entretenimento, a música e agora a criação de software. Hoje, até um jovem sem conhecimento técnico prévio consegue criar sistemas completos apenas com instruções em português estruturado.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40">
                      <strong className="text-amber-400 block text-xs font-black">⭐ Google AI Studio (Recomendado)</strong>
                      <p className="text-zinc-300 mt-1">
                        Destaca-se pela qualidade superior do código, integração nativa com o ecossistema Google (Firebase, Gemini Models), suporte completo a TypeScript/React e facilidade de exportação para o GitHub. É a ferramenta que permite sair do protótipo simples para a escala profissional.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <strong className="text-zinc-300 block text-xs font-black">Alternativas: Lovable, Replit, Create XYZ</strong>
                      <p className="text-zinc-400 mt-1">
                        O Lovable é ótimo para interfaces rápidas, o Replit oferece terminal em nuvem e ferramentas como Create XYZ e Base44 oferecem abordagens simplificadas, mas com menor flexibilidade em projetos de banco de dados robustos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ENGENHARIA DE PROMPTS & TEMPLATE MESTRE (SLIDE 8, 9, 10, 11 & 12) */}
                <div className="page-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide border-b border-zinc-800 pb-2">
                    🎯 A ARTE DO PROMPT MESTRE & OS 18 ELEMENTOS ESSENCIAIS
                  </h2>
                  <p className="text-zinc-300">
                    Um prompt mal construído gera aplicativos quebrados, amadores ou genéricos. Um <strong>Prompt Mestre</strong> é como uma receita detalhada de engenharia.
                  </p>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-[10px]">
                    <span className="text-amber-400 font-bold uppercase block">As 18 Seções do Template Profissional Reutilizável:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-zinc-300">
                      <div>1. Identidade do Projeto</div>
                      <div>2. Objetivo Principal</div>
                      <div>3. Público-Alvo</div>
                      <div>4. Funcionalidades Chave</div>
                      <div>5. Telas & Páginas</div>
                      <div>6. Design & UI/UX</div>
                      <div>7. Paleta de Cores</div>
                      <div>8. Navegação & Fluxo</div>
                      <div>9. Estrutura de Banco</div>
                      <div>10. Autenticação</div>
                      <div>11. Regras de Negócio</div>
                      <div>12. Segurança & Acesso</div>
                      <div>13. Tecnologias</div>
                      <div>14. Responsividade Mobile</div>
                      <div>15. Tratamento de Erros</div>
                      <div>16. Requisitos Técnicos</div>
                      <div>17. Restrições</div>
                      <div>18. Critérios de Aceitação</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px]">
                    <strong className="text-emerald-400 block font-bold">✅ Exemplo do Prompt Bom vs ❌ Prompt Ruim:</strong>
                    <p className="text-zinc-300 mt-1">
                      <strong>❌ Ruim:</strong> <em>"Cria um app de vendas aí."</em> (Vago, sem cores, sem regras).<br/>
                      <strong>✅ Bom:</strong> <em>"Cria um app esportivo chamado 'Dr. PALPITES' com fundo #020617, botões em âmbar #f59e0b e verde #10b981. Deve conter tela de login com Firebase, lista de bilhetes com odds, botão de copiar código em 1 clique para Elephant Bet/Premier Bet, e suporte via WhatsApp."</em>
                    </p>
                  </div>
                </div>

                {/* TUTORIAL PASSO A PASSO DO FIREBASE (SLIDE 13 & 16) */}
                <div className="page-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide border-b border-zinc-800 pb-2">
                    🗄️ GUIA PASSO A PASSO: CRIANDO SEU BANCO NO FIREBASE DO GOOGLE
                  </h2>
                  <p className="text-zinc-300">
                    O Firebase é a infraestrutura em nuvem oficial da Google. Ele armazena os dados dos usuários, autentica logins e sincroniza tudo em tempo real.
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-[10px] text-zinc-300">
                    <li><strong>Pesquisa no Google:</strong> Digita <em>"Firebase Console"</em> e acessa <code>firebase.google.com</code> com seu Gmail.</li>
                    <li><strong>Criação do Projeto:</strong> Clica em <em>"+ Adicionar Projeto"</em>, digita o nome (Ex: <code>dr-palpites</code>) e desativa o Google Analytics para simplificar.</li>
                    <li><strong>Ativação do Realtime Database:</strong> No menu lateral esquerdo, clica em <em>Compilação &gt; Realtime Database &gt; Criar banco de dados</em>.</li>
                    <li><strong>Regras em Modo de Teste:</strong> Escolhe <em>"Iniciar em modo de teste"</em> e clica em Ativar para liberar leitura e escrita.</li>
                    <li><strong>Pegar a Chave Web:</strong> Vai no ícone da Engrenagem ⚙️ (Configurações do Projeto) &gt; Seus Apps &gt; Clica no ícone Web <code>&lt;/&gt;</code> &gt; Copia o bloco de código <code>firebaseConfig</code> e entrega à IA.</li>
                  </ol>
                </div>

                {/* GITHUB & NETLIFY (SLIDE 14 & 18) */}
                <div className="page-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide border-b border-zinc-800 pb-2">
                    🐙 GITHUB & HOSPEDAGEM NO NETLIFY COM O ARQUIVO _redirects
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                      <strong className="text-amber-400 block text-xs font-black">GitHub: O Cofre Seguro</strong>
                      <p className="text-zinc-300">
                        1. Cria conta gratuita no <code>github.com</code>.<br/>
                        2. No Google AI Studio, clica em <em>Export &gt; Export to GitHub</em>.<br/>
                        3. Autoriza a conexão e cria o repositório seguro com 1 clique.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                      <strong className="text-amber-400 block text-xs font-black">Netlify: Deploy em 10 Segundos</strong>
                      <p className="text-zinc-300">
                        1. Cria o arquivo <code>_redirects</code> na pasta pública com <code>/* /index.html 200</code> (evita erro 404).<br/>
                        2. Roda <code>npm run build</code> e arrasta a pasta <code>dist</code> no Netlify Drop.<br/>
                        3. Teu app ganha link seguro oficial com HTTPS 🔒 grátis!
                      </p>
                    </div>
                  </div>
                </div>

                {/* UI PROFISSIONAL & SEGURANÇA (SLIDE 15, 17 & 19) */}
                <div className="page-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide border-b border-zinc-800 pb-2">
                    🛡️ UI PROFISSIONAL: REMOVENDO "TEXTOS SUJOS" & REGRAS DE SEGURANÇA
                  </h2>
                  <p className="text-zinc-300">
                    A primeira versão gerada por qualquer IA costuma vir com textos técnicos desnecessários (como <em>"Firebase connected"</em>, <em>"Database synchronized"</em>). Estes termos devem ser completamente ocultados do usuário final.
                  </p>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-zinc-300 space-y-1">
                    <strong className="text-amber-400 block font-bold">Instrução de Limpeza de Interface:</strong>
                    <em>"Por favor, oculte todas as mensagens técnicas e dados confidenciais do visual da aplicação. Os utilizadores precisam ver apenas as informações esportivas, botões de ação e mensagens amigáveis de sucesso ou erro."</em>
                  </div>
                </div>

                {/* MONETIZAÇÃO COM ADSENSE & OFFERWALL */}
                <div className="page-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide border-b border-zinc-800 pb-2">
                    💰 MONETIZAÇÃO: GOOGLE ADSENSE, ARQUIVO ads.txt & OFFERWALL 24H
                  </h2>
                  <p className="text-zinc-300">
                    O modelo de receita do <strong>Dr. PALPITES</strong> combina 3 fontes complementares de faturamento:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[10px] text-zinc-300">
                    <li><strong>Arquivo ads.txt:</strong> Colocado na raiz pública (<code>/public/ads.txt</code>) garantindo a aprovação do Google com o código de editor <code>pub-8959686518292972</code>.</li>
                    <li><strong>Offerwall 24 Horas:</strong> O usuário que não quer pagar assinatura pode assistir a um anúncio em vídeo voluntário para liberar o acesso VIP completo por 24 horas.</li>
                    <li><strong>Parcerias e Afiliados:</strong> Links diretos de afiliação e suporte direto no WhatsApp.</li>
                  </ul>
                </div>

                {/* PROJETO COMPLETO & MÉTODO TECNO (SLIDE 20 & 21) */}
                <div className="page-card p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-wide border-b border-zinc-800 pb-2">
                    🏆 O MÉTODO T.E.C.N.O. DE DESENVOLVIMENTO COM IA
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[10px]">
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <strong className="text-amber-500 block font-black text-xs">T</strong>
                      <span className="font-bold text-white block mt-1">Transformar</span>
                      <span className="text-[9px] text-zinc-400 block mt-1">A ideia em requisitos de 3 telas.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <strong className="text-amber-500 block font-black text-xs">E</strong>
                      <span className="font-bold text-white block mt-1">Estruturar</span>
                      <span className="text-[9px] text-zinc-400 block mt-1">O banco Firebase e as chaves.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <strong className="text-amber-500 block font-black text-xs">C</strong>
                      <span className="font-bold text-white block mt-1">Construir</span>
                      <span className="text-[9px] text-zinc-400 block mt-1">Com prompts mestres no AI Studio.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <strong className="text-amber-500 block font-black text-xs">N</strong>
                      <span className="font-bold text-white block mt-1">Navegar</span>
                      <span className="text-[9px] text-zinc-400 block mt-1">Corrigir bugs e testar no celular.</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                      <strong className="text-amber-500 block font-black text-xs">O</strong>
                      <span className="font-bold text-white block mt-1">Operar</span>
                      <span className="text-[9px] text-zinc-400 block mt-1">Deploy no Netlify e AdSense.</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 text-center space-y-1">
                    <p className="text-amber-400 font-bold text-xs italic">"Enquanto eu não conseguir, não vou parar."</p>
                    <p className="text-[9px] text-zinc-400">Estabelece objetivos claros antes de iniciar um projeto — seja onde estiveres, é sempre uma oportunidade de criar e vencer. 🌟</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/60">
                <button 
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 text-[10px] font-black uppercase text-zinc-400 hover:text-white"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black font-black uppercase text-[10px] rounded-xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg"
                >
                  <Download size={14} /> Imprimir / Baixar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={isDarkMode ? `min-h-screen bg-[#020617] text-white ${activeTab === 'chat' ? 'h-screen overflow-hidden pb-0' : 'pb-28'} transition-colors duration-300` : `min-h-screen bg-white text-slate-900 ${activeTab === 'chat' ? 'h-screen overflow-hidden pb-0' : 'pb-28'} transition-colors duration-300`}>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex animate-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsSettingsOpen(false)} />
          <div className={isDarkMode ? "relative ml-auto h-full w-[80%] max-w-sm p-6 flex flex-col shadow-2xl bg-[#020617] border-l-4 border-zinc-800" : "relative ml-auto h-full w-[80%] max-w-sm p-6 flex flex-col shadow-2xl bg-white border-l-4 border-slate-100"}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase italic text-amber-500 tracking-tighter leading-none">{t('settings')}</h2>
              <button onClick={() => setIsSettingsOpen(false)} className={isDarkMode ? "p-2.5 rounded-xl border-2 border-zinc-800 bg-zinc-900/40 text-amber-500 active:scale-90 transition-all shadow-xl" : "p-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-amber-500 active:scale-90 transition-all shadow-xl"}><X size={20}/></button>
            </div>
            
            <div className="flex flex-col items-center mb-6 gap-2">
              <div className="relative group">
                <div className={isDarkMode ? "w-24 h-24 rounded-full border-4 border-amber-500/30 bg-zinc-900 overflow-hidden flex items-center justify-center shadow-2xl" : "w-24 h-24 rounded-full border-4 border-amber-500/30 bg-slate-50 overflow-hidden flex items-center justify-center shadow-2xl"}>
                  {user.profilePic ? (
                    <img src={user.profilePic} className="w-full h-full object-cover" />
                  ) : (
                    <User size={44} className={isDarkMode ? "text-zinc-600" : "text-slate-400"} />
                  )}
                </div>
                <label className="absolute bottom-1 right-1 bg-amber-500 p-2.5 rounded-full cursor-pointer shadow-xl active:scale-90 transition-all border-2 border-black">
                  <Camera size={16} className="text-black" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                </label>
              </div>
              <h3 className={isDarkMode ? "text-sm font-black italic uppercase text-white" : "text-sm font-black italic uppercase text-slate-900"}>{user.username}</h3>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              <div className="space-y-2">
                <h3 className="text-[8px] font-black uppercase italic text-amber-500/60 tracking-[0.2em]">{t('lang').toUpperCase()} & {t('theme').toUpperCase()}</h3>
                <button onClick={() => {
                   const langs: Lang[] = ['pt', 'en', 'fr', 'es'];
                   const next = langs[(langs.indexOf(lang) + 1) % langs.length];
                   setLang(next);
                   localStorage.setItem("dr_lang", next);
                }} className={isDarkMode ? "flex items-center justify-between w-full p-3.5 rounded-[1rem] border-2 bg-zinc-800/20 border-zinc-800/40" : "flex items-center justify-between w-full p-3.5 rounded-[1rem] border-2 bg-slate-50 border-slate-200"}>
                  <div className="flex items-center gap-3"><Globe size={18} className="text-amber-500" /> <span className={isDarkMode ? "text-[10px] font-black uppercase italic" : "text-[10px] font-black uppercase italic text-slate-900"}>{t('lang')}</span></div>
                  <span className="text-[10px] font-black text-amber-500 uppercase">{lang}</span>
                </button>
                <button onClick={() => { setIsDarkMode(!isDarkMode); localStorage.setItem("dr_theme", !isDarkMode ? "dark" : "light"); }} className={isDarkMode ? "flex items-center justify-between w-full p-3.5 rounded-[1rem] border-2 bg-zinc-800/20 border-zinc-800/40" : "flex items-center justify-between w-full p-3.5 rounded-[1rem] border-2 bg-slate-50 border-slate-200"}>
                  <div className="flex items-center gap-3">{isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-amber-500" />} <span className={isDarkMode ? "text-[10px] font-black uppercase italic" : "text-[10px] font-black uppercase italic text-slate-900"}>{t('theme')}</span></div>
                  <span className="text-[10px] font-black text-amber-500 uppercase">{isDarkMode ? 'ESCURO' : 'CLARO'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-[8px] font-black uppercase italic text-amber-500/60 tracking-[0.2em]">{t('referralTitle')}</h3>
                {!user.referralCode ? (
                  <button onClick={generateReferralCode} className="flex items-center justify-center gap-3 w-full p-3.5 rounded-[1rem] border-2 bg-amber-500 text-black font-black uppercase italic text-[9px] shadow-lg active:scale-95 transition-all border-amber-400">
                    <UserPlus size={16} /> {t('generateReferral')}
                  </button>
                ) : (
                  <button onClick={() => setIsReferralPanelOpen(true)} className={isDarkMode ? "flex items-center justify-between w-full p-3.5 rounded-[1rem] border-2 bg-zinc-800/20 border-zinc-800/40 font-black uppercase italic text-[9px]" : "flex items-center justify-between w-full p-3.5 rounded-[1rem] border-2 bg-slate-50 border-slate-200 font-black uppercase italic text-[9px]"}>
                    <div className="flex items-center gap-3"><Users size={16} className="text-amber-500" /> {t('referralTitle')}</div>
                    <span className="text-[10px] font-black text-amber-500">{referrals.length}</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-[8px] font-black uppercase italic text-amber-500/60 tracking-[0.2em]">STATUS</h3>
                {hasVipAccess ? (
                  <div className={isDarkMode ? "w-full p-4 rounded-[1rem] border-2 font-black uppercase italic text-[10px] flex flex-col items-center gap-1 shadow-md bg-amber-500/10 border-amber-500/20 text-amber-500" : "w-full p-4 rounded-[1rem] border-2 font-black uppercase italic text-[10px] flex flex-col items-center gap-1 shadow-md bg-amber-50 border-amber-200 text-amber-600"}>
                    <div className="flex items-center gap-2"><Crown size={16} /> {t('vipStatus')}</div>
                    <span className="text-[9px] opacity-70 leading-none">{vipDaysRemaining} {t('daysRemaining')}</span>
                  </div>
                ) : (
                  <a href={appConfig.loja} target="_blank" className="w-full bg-amber-500 text-black p-3.5 rounded-[1rem] font-black uppercase italic flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-[10px]">
                    <Crown size={18} /> {t('buyVip')}
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-[8px] font-black uppercase italic text-amber-500/60 tracking-[0.2em]">{t('community').toUpperCase()}</h3>
                <div className="grid grid-cols-1 gap-1.5">
                  <a href={appConfig.telegram} target="_blank" className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1rem] border-2 bg-zinc-800/20 border-zinc-800/40 text-white font-black uppercase italic text-[9px] transition-all active:scale-95" : "flex items-center gap-3 p-3.5 rounded-[1rem] border-2 bg-slate-50 border-slate-200 text-slate-900 font-black uppercase italic text-[9px] transition-all active:scale-95"}><Send size={16} className="text-sky-500" /> TELEGRAM</a>
                  <a href={appConfig.whatsapp} target="_blank" className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1rem] border-2 bg-zinc-800/20 border-zinc-800/40 text-white font-black uppercase italic text-[9px] transition-all active:scale-95" : "flex items-center gap-3 p-3.5 rounded-[1rem] border-2 bg-slate-50 border-slate-200 text-slate-900 font-black uppercase italic text-[9px] transition-all active:scale-95"}><MessageCircle size={16} className="text-emerald-500" /> GRUPO WHATSAPP</a>
                  <a href={appConfig.facebook} target="_blank" className={isDarkMode ? "flex items-center gap-3 p-3.5 rounded-[1rem] border-2 bg-zinc-800/20 border-zinc-800/40 text-white font-black uppercase italic text-[9px] transition-all active:scale-95" : "flex items-center gap-3 p-3.5 rounded-[1rem] border-2 bg-slate-50 border-slate-200 text-slate-900 font-black uppercase italic text-[9px] transition-all active:scale-95"}><Facebook size={16} className="text-blue-600" /> FACEBOOK</a>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className={isDarkMode ? "mt-6 flex items-center justify-center gap-3 p-4 rounded-[1.2rem] border-2 bg-red-500/10 border-red-500/20 text-red-500 font-black uppercase italic active:scale-95 transition-all text-[10px]" : "mt-6 flex items-center justify-center gap-3 p-4 rounded-[1.2rem] border-2 bg-red-50 border-red-100 text-red-600 font-black uppercase italic active:scale-95 transition-all text-[10px]"}><LogOut size={18} /> {t('logout')}</button>
          </div>
        </div>
      )}

      {/* Referral Dashboard Panel */}
      {isReferralPanelOpen && (
        <div className="fixed inset-0 z-[70] flex animate-in">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsReferralPanelOpen(false)} />
          <div className={isDarkMode ? "relative m-auto w-[90%] max-w-sm p-6 rounded-[2.5rem] border-4 shadow-2xl flex flex-col bg-[#020617] border-zinc-800" : "relative m-auto w-[90%] max-w-sm p-6 rounded-[2.5rem] border-4 shadow-2xl flex flex-col bg-white border-slate-200"}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase italic text-amber-500 tracking-tighter leading-none">{t('referralTitle')}</h2>
              <button onClick={() => setIsReferralPanelOpen(false)} className={isDarkMode ? "p-2 rounded-xl border-2 border-zinc-800 text-amber-500 active:scale-90" : "p-2 rounded-xl border-2 border-slate-200 text-amber-500 active:scale-90"}><X size={18}/></button>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
              <div className="p-4 rounded-2xl bg-amber-500 text-black text-center space-y-2 shadow-lg">
                <span className="text-[10px] font-black uppercase italic tracking-widest">{t('yourCode')}</span>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-2xl font-black italic border-b-2 border-black/20 pb-2">{user?.referralCode}</div>
                  <button onClick={() => copyToClipboard(user?.referralCode || "")} className="p-2 bg-black/10 rounded-lg active:scale-90 transition-all border border-black/10" title={t('copyCode')}><Copy size={16} /></button>
                </div>
                <p className="text-[9px] font-black uppercase leading-tight mt-2 opacity-80">{t('referralInfo')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={isDarkMode ? "p-3 rounded-2xl border-2 text-center bg-zinc-900 border-zinc-800" : "p-3 rounded-2xl border-2 text-center bg-slate-50 border-slate-200"}>
                   <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">{t('totalInvites')}</span>
                   <span className="text-xl font-black text-amber-500">{referrals.length}</span>
                </div>
                <div className={isDarkMode ? "p-3 rounded-2xl border-2 text-center bg-zinc-900 border-zinc-800" : "p-3 rounded-2xl border-2 text-center bg-slate-50 border-slate-200"}>
                   <span className="text-[8px] font-black text-zinc-500 uppercase block mb-1">{t('unclaimedInvites')}</span>
                   <span className="text-xl font-black text-emerald-500">{unclaimedInvitesCount}</span>
                </div>
              </div>

              <button 
                onClick={handleClaimVip}
                disabled={loading || unclaimedInvitesCount < 20}
                className={`w-full py-4 rounded-2xl font-black uppercase italic shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${unclaimedInvitesCount >= 20 ? 'bg-emerald-500 text-black' : 'bg-zinc-500/20 text-zinc-500 grayscale cursor-not-allowed'}`}
              >
                {loading ? <RefreshCw className="animate-spin" /> : <><Gift size={20} /> {t('claimPrize')}</>}
              </button>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase italic text-amber-500 tracking-widest">{t('inviteList')}</span>
                <div className={isDarkMode ? "max-h-48 overflow-y-auto rounded-2xl border-2 p-2 bg-black border-zinc-800" : "max-h-48 overflow-y-auto rounded-2xl border-2 p-2 bg-slate-50 border-slate-200"}>
                  {referrals.length === 0 ? <p className="text-center py-10 text-[9px] uppercase font-black opacity-30">{t('noInvites')}</p> :
                    referrals.map((r, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 border-b last:border-0 border-zinc-800/20">
                        <span className="text-[10px] font-black uppercase italic">{r.username}</span>
                        <span className="text-[8px] font-black opacity-40">{new Date(r.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className={isDarkMode ? "sticky top-0 z-40 border-b-4 bg-[#020617] border-zinc-800 px-5 py-3 shadow-lg" : "sticky top-0 z-40 border-b-4 bg-white border-slate-200 px-5 py-3 shadow-lg"}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-500 flex items-center justify-center bg-zinc-950 shadow-lg">
              <img src={appConfig.logoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://i.ibb.co/fYTYtmVp/IMG-20260714-WA0001-2.webp'; }} />
            </div>
            <div>
              <h1 className={isDarkMode ? "text-lg font-black italic tracking-tighter uppercase leading-none text-white" : "text-lg font-black italic tracking-tighter uppercase leading-none text-slate-900"}>DR <span className="text-amber-500">PALPITES</span></h1>
              <span className="text-[8px] font-black uppercase text-amber-500 block tracking-[0.15em] mt-1 opacity-100">{t('palpites').toUpperCase()}: {getFirebaseKey().split('-').reverse().join('/')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsReferralPanelOpen(true)} className={isDarkMode ? "p-2.5 rounded-[1rem] border-2 border-zinc-800 bg-zinc-900/50 text-amber-500 active:scale-90 transition-all shadow-md" : "p-2.5 rounded-[1rem] border-2 border-slate-200 bg-white text-amber-500 active:scale-90 transition-all shadow-md"} title={t('referralTitle')}><UserPlus size={24} /></button>
            <button onClick={() => setIsSettingsOpen(true)} className={isDarkMode ? "p-2.5 rounded-[1rem] border-2 border-zinc-800 bg-zinc-900/50 text-amber-500 active:scale-90 transition-all shadow-md" : "p-2.5 rounded-[1rem] border-2 border-slate-200 bg-white text-amber-500 active:scale-90 transition-all shadow-md"}><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {!hasVipAccess && (
        <a href={appConfig.loja} target="_blank" className="bg-amber-50 py-2.5 overflow-hidden border-b-2 border-amber-600 relative flex items-center shadow-md cursor-pointer block">
           <div className="marquee-wrapper flex shrink-0">
             <div className="marquee-content inline-block font-black italic uppercase text-[9px] text-black tracking-[0.1em] px-10">{t('tickerText')}</div>
             <div className="marquee-content inline-block font-black italic uppercase text-[9px] text-black tracking-[0.1em] px-10">{t('tickerText')}</div>
           </div>
        </a>
      )}

      <main className={activeTab === 'chat' ? (hasVipAccess ? "max-w-md mx-auto p-4 h-[calc(100vh-140px)] flex flex-col space-y-0 overflow-hidden" : "max-w-md mx-auto p-4 h-[calc(100vh-180px)] flex flex-col space-y-0 overflow-hidden") : "max-w-md mx-auto p-4 space-y-5"}>
        {activeTab === "hoje" && (
          <section className="space-y-5 animate-in">
            <div className="flex justify-between items-start px-1">
              <div className="space-y-1">
                <span className={isDarkMode ? "text-[9px] font-black uppercase italic tracking-[0.2em] block text-zinc-500" : "text-[9px] font-black uppercase italic tracking-[0.2em] block text-slate-400"}>{t('welcome')}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className={isDarkMode ? "text-3xl font-black italic uppercase leading-none tracking-tighter text-white" : "text-3xl font-black italic uppercase leading-none tracking-tighter text-slate-900"}>{user?.username}</h2>
                  {hasVipAccess && (
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-500 text-black px-3 py-1.5 rounded-xl flex items-center gap-2 font-black italic text-[11px] shadow-lg">
                        <Crown size={14} /> VIP
                      </div>
                      <span className="text-emerald-500 font-black italic uppercase text-[12px] tracking-tight drop-shadow-sm">
                        {user?.province}, {user?.country}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <AdSenseBanner isDarkMode={isDarkMode} />

            {loading ? <div className="py-40 flex justify-center"><RefreshCw className="animate-spin text-amber-500" size={40} /></div> : (
              matches.length === 0 ? <div className={isDarkMode ? "py-32 text-center font-black uppercase italic tracking-widest text-lg text-zinc-800" : "py-32 text-center font-black uppercase italic tracking-widest text-lg text-slate-300"}>{t('vazio')}</div> : 
              matches.map((m, i) => {
                const isMatchVip = m.isVipMatch === true || (i < 5);
                const isMatchUnlocked = hasVipAccess || unlockedMatches.includes(`${m.homeTeam}-${m.awayTeam}`);
                const isMatchLocked = isMatchVip && !isMatchUnlocked;

                const blockTitles = [
                  "🔥 O MELHOR PALPITE DE HOJE!",
                  "⚡ 97% DE ASSERTIVIDADE GARANTIDA",
                  "🎯 SUPER ACUMULADORA DE OURO",
                  "💎 PALPITE PREMIUM DO DR. PALPITES",
                  "⭐ DUPLA EXCLUSIVA DA CIÊNCIA"
                ];
                const blockTitle = blockTitles[i % blockTitles.length];

                return (
                  <div key={i} className={isDarkMode ? "border-4 rounded-[2.5rem] overflow-hidden shadow-xl bg-zinc-900/60 border-zinc-800" : "border-4 rounded-[2.5rem] overflow-hidden shadow-xl bg-white border-slate-200"}>
                    <div className={isDarkMode ? "p-3.5 flex justify-between items-center text-[9px] font-black uppercase border-b-2 bg-black/60 border-zinc-800" : "p-3.5 flex justify-between items-center text-[9px] font-black uppercase border-b-2 bg-slate-50 border-slate-100"}>
                      <span className={isDarkMode ? "text-white tracking-widest" : "text-slate-600 tracking-widest"}>
                        {isMatchLocked ? "LIGA PREMIUM VIP" : m.league}
                      </span> 
                      {isMatchVip && <span className="bg-amber-500 text-black px-2 py-0.5 rounded flex items-center gap-1 text-[7px]"><Crown size={8}/> VIP</span>}
                      <span className="text-amber-500 tracking-[0.05em]">{m.startTime}</span>
                    </div>
                    <div className="p-5">
                      {isMatchLocked ? (
                        <div className="space-y-5 text-center">
                          {/* Blurred teams header */}
                          <h3 className={isDarkMode ? "text-lg font-black uppercase italic tracking-tighter text-center mb-1 leading-tight filter blur-md select-none pointer-events-none opacity-25 text-white" : "text-lg font-black uppercase italic tracking-tighter text-center mb-1 leading-tight filter blur-md select-none pointer-events-none opacity-25 text-slate-900"}>
                            {m.homeTeam.substring(0, Math.min(3, m.homeTeam.length))}***** <span className="text-[10px] text-amber-500/50 mx-2 font-black italic">vs</span> {m.awayTeam.substring(0, Math.min(3, m.awayTeam.length))}*****
                          </h3>
                          
                          {/* Interactive Block Screen */}
                          <div className={isDarkMode ? "p-5 rounded-[2rem] border-4 bg-zinc-950/80 border-amber-500/20 shadow-inner space-y-4" : "p-5 rounded-[2rem] border-4 bg-amber-500/5 border-amber-500/15 space-y-4"}>
                            <div className="flex flex-col items-center gap-1">
                              <div className="bg-amber-500 p-3 rounded-full border-2 border-black shadow-lg animate-pulse">
                                <LockKeyhole size={24} className="text-black" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-2">{blockTitle}</span>
                              <p className={isDarkMode ? "text-[11px] font-bold uppercase text-zinc-400 px-2 leading-relaxed" : "text-[11px] font-bold uppercase text-slate-600 px-2 leading-relaxed"}>
                                Liberte as odds e as previsões científicas premium agora mesmo!
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              <button 
                                onClick={() => startAdPlayback("match", `${m.homeTeam}-${m.awayTeam}`)}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl text-[10px] uppercase italic flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                              >
                                🔓 DESBLOQUEAR GRÁTIS (VER ANÚNCIO)
                              </button>
                              <a 
                                href={appConfig.loja}
                                target="_blank"
                                className={isDarkMode ? "w-full py-4 rounded-xl border-2 text-[10px] font-black uppercase italic flex items-center justify-center gap-2 transition-all active:scale-95 bg-zinc-900 border-zinc-800 text-amber-500 hover:bg-zinc-800" : "w-full py-4 rounded-xl border-2 text-[10px] font-black uppercase italic flex items-center justify-center gap-2 transition-all active:scale-95 bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-md"}
                              >
                                <Crown size={14} className="text-amber-500" strokeWidth={3} /> TORNAR-SE MEMBRO VIP
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className={isDarkMode ? "text-lg font-black uppercase italic tracking-tighter text-center mb-5 leading-tight text-white" : "text-lg font-black uppercase italic tracking-tighter text-center mb-5 leading-tight text-slate-900"}>{m.homeTeam} <span className="text-[10px] text-amber-500/50 mx-2 font-black italic">vs</span> {m.awayTeam}</h3>
                          <div className="space-y-2">
                            {m.tips?.map((tip: any, idx: number) => {
                              const tipId = `${m.homeTeam}-${m.awayTeam}-${tip.market}-${tip.selection}`;
                              const isSelected = betSlip.some(s => s.id === tipId);
                              const selectionDisplay = cleanSelectionText(tip.market, tip.selection);
                              return (
                                <button key={idx} onClick={() => handleToggleTip(m, tip)} className={isSelected ? "w-full p-4 rounded-[1.5rem] border-4 flex items-center justify-between transition-all active:scale-95 shadow-md bg-amber-500 border-amber-400 text-black shadow-lg" : (isDarkMode ? "w-full p-4 rounded-[1.5rem] border-4 flex items-center justify-between transition-all active:scale-95 shadow-md bg-black border-zinc-800" : "w-full p-4 rounded-[1.5rem] border-4 flex items-center justify-between transition-all active:scale-95 shadow-md bg-slate-50 border-slate-300")}>
                                    <div className="text-left leading-tight">
                                      <span className={isSelected ? "text-[10px] font-black uppercase block mb-0.5 text-black/85" : (isDarkMode ? "text-[10px] font-black uppercase block mb-0.5 text-amber-400" : "text-[10px] font-black uppercase block mb-0.5 text-amber-600")}>{tip.market}</span>
                                      <span className={isSelected ? "text-[12px] font-black uppercase italic tracking-tight text-black" : (isDarkMode ? "text-[12px] font-black uppercase italic tracking-tight text-white" : "text-[12px] font-black uppercase italic tracking-tight text-slate-900")}>{selectionDisplay}</span>
                                    </div>
                                    <span className="text-xl font-black italic tracking-tighter">@{parseFloat(tip.odds).toFixed(2)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div className={isDarkMode ? "p-6 rounded-[2rem] border-4 text-center space-y-2 shadow-inner bg-zinc-900/40 border-zinc-800" : "p-6 rounded-[2rem] border-4 text-center space-y-2 shadow-inner bg-slate-50 border-slate-200"}>
               <p className="text-[11px] font-black uppercase italic text-amber-500 tracking-wider">{t('footerInfo')}</p>
               <div className="flex justify-center gap-4 opacity-30">
                 <Globe size={16} /> <Flag size={16} /> <Crown size={16} />
               </div>
            </div>
          </section>
        )}

        {activeTab === "acumulador" && (
          <section className="space-y-6 animate-in">
             <div className="flex items-center gap-3 px-2">
               <div className="bg-amber-500 p-2 rounded-xl shadow-md"><Layers size={20} className="text-black" /></div>
               <h2 className={isDarkMode ? "text-lg font-black uppercase italic tracking-tighter drop-shadow-md text-white" : "text-lg font-black uppercase italic tracking-tighter drop-shadow-md text-slate-900"}>{t('fichas')}</h2>
             </div>

             <AdSenseBanner isDarkMode={isDarkMode} />

             {loading ? <div className="py-40 flex justify-center"><RefreshCw className="animate-spin text-amber-500" size={40} /></div> : (
               fichas.length === 0 ? <div className={isDarkMode ? "py-40 text-center font-black uppercase italic tracking-widest text-lg text-zinc-800" : "py-40 text-center font-black uppercase italic tracking-widest text-lg text-slate-300"}>{t('vazio')}</div> : 
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {fichas.map((a, i) => {
                   const isLocked = i > 0 && !hasVipAccess;

                   if (isLocked) {
                     return (
                      <div key={i} className={isDarkMode ? "p-10 rounded-[3rem] border-4 flex flex-col items-center text-center space-y-6 shadow-2xl bg-zinc-900/80 border-zinc-800 backdrop-blur-xl" : "p-10 rounded-[3rem] border-4 flex flex-col items-center text-center space-y-6 shadow-2xl bg-slate-50 border-slate-200"}>
                        <div className={isDarkMode ? "p-6 rounded-[2rem] border-4 relative shadow-xl bg-amber-500/10 border-amber-500/20" : "p-6 rounded-[2rem] border-4 relative shadow-xl bg-amber-50 border-amber-200"}>
                          <LockKeyhole size={50} className="text-amber-500" />
                          <Crown size={22} className="absolute -top-3 -right-3 text-amber-500 animate-bounce" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xl font-black italic uppercase text-amber-500 leading-none tracking-tighter">{t('vipRestrictedTitle')}</h3>
                          <p className={isDarkMode ? "text-[10px] font-black uppercase leading-relaxed italic px-2 text-white" : "text-[10px] font-black uppercase leading-relaxed italic px-2 text-slate-600"}>{t('vipRestrictedText')}</p>
                        </div>
                        <a href={`https://wa.me/${appConfig.support}?text=${encodeURIComponent(t('vipWhatsappMsg'))}`} target="_blank" className="w-full bg-emerald-500 text-black p-4 rounded-[1.5rem] font-black uppercase italic flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-[11px] tracking-tighter">
                          <MessageCircle size={20} /> {t('talkToCeo')}
                        </a>
                      </div>
                     );
                   }

                   return (
                     <div key={i} className={isDarkMode ? "p-1 rounded-[3rem] border-4 shadow-xl bg-zinc-900/60 border-zinc-800 transition-all hover:scale-[1.02]" : "p-1 rounded-[3rem] border-4 shadow-xl bg-white border-slate-200 transition-all hover:scale-[1.02]"}>
                        <div className="p-6 space-y-5">
                           <div className="flex justify-between items-start">
                             <div className="space-y-1 border-l-4 border-amber-500 pl-3">
                               <h3 className="text-[10px] font-black italic uppercase text-amber-500 tracking-[0.1em] leading-none">{i === 0 && !hasVipAccess ? t('publicAccumulator') : (a.type || 'ELITE IA')}</h3>
                               <span className={isDarkMode ? "text-[8px] font-black uppercase block tracking-widest leading-none text-white/50" : "text-[8px] font-black uppercase block tracking-widest leading-none text-slate-400"}>{t('precisionAnalysis')}</span>
                             </div>
                           </div>
                           <div className={isDarkMode ? "grid grid-cols-2 gap-4 p-4 rounded-[1.5rem] border-2 bg-black/60 border-zinc-800/40" : "grid grid-cols-2 gap-4 p-4 rounded-[1.5rem] border-2 bg-slate-50 border-slate-200"}>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2"><span className="text-[9px] font-black text-amber-500 italic">💰</span> <span className={isDarkMode ? "text-[9px] font-black uppercase tracking-tighter text-white" : "text-[9px] font-black uppercase tracking-tighter text-slate-700"}>{t('stake')}: {formatValueDisplay(a.stake || 0)}</span></div>
                                <div className="flex items-center gap-2"><span className="text-[9px] font-black text-emerald-500 italic">⭐</span> <span className="text-[9px] font-black uppercase text-emerald-500 italic tracking-tighter leading-none">{t('totalWinnings')} : {formatValueDisplay(a.estimatedReturn || 0)}</span></div>
                                <div className="flex items-center gap-2"><span className="text-[9px] font-black text-amber-500 italic">🚦</span> <span className="text-[9px] font-black uppercase text-amber-500 italic tracking-tighter leading-none">{a.assertiveness || '90'}% ASSERTIVO</span></div>
                              </div>
                              <div className={isDarkMode ? "flex flex-col items-end justify-center border-l-2 pl-3 border-zinc-800/50" : "flex flex-col items-end justify-center border-l-2 pl-3 border-slate-200"}>
                                <span className="text-[8px] font-black uppercase text-amber-500/50 block mb-1 tracking-widest leading-none">{t('totalOdds')}</span>
                                <span className="text-3xl font-black italic text-amber-500 tracking-tighter leading-none">@{typeof a.totalOdds === 'number' ? a.totalOdds.toFixed(2) : parseFloat(String(a.totalOdds || 0)).toFixed(2)}</span>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 gap-2">
                              {[
                                { label: 'ELEPHANT BET', id: a.elephantBetId },
                                { label: 'PREMIER BET', id: a.premierBetId },
                                { label: 'BANTUBET', id: a.bantuBetId }
                              ].map(bookie => bookie.id && (
                                <div key={bookie.label} className={isDarkMode ? "flex items-center justify-between p-3 rounded-xl border-2 bg-zinc-800/40 border-zinc-700/50" : "flex items-center justify-between p-3 rounded-xl border-2 bg-slate-100 border-slate-200"}>
                                  <div className="flex flex-col">
                                    <span className="text-[7px] font-black uppercase text-zinc-500">{bookie.label} ID</span>
                                    <span className={isDarkMode ? "text-[11px] font-black italic text-white" : "text-[11px] font-black italic text-black"}>{bookie.id}</span>
                                  </div>
                                  <button onClick={() => copyToClipboard(bookie.id!)} className="p-2 bg-amber-500 text-black rounded-lg active:scale-90 transition-all"><ClipboardCheck size={16} /></button>
                                </div>
                              ))}
                           </div>
                           <div className="space-y-4 pt-1">
                              {a.selections.map((s, idx) => (
                                <div key={idx} className={isDarkMode ? "space-y-1 relative pb-4 border-b-2 last:border-0 last:pb-0 border-zinc-800/40" : "space-y-1 relative pb-4 border-b-2 last:border-0 last:pb-0 border-slate-100"}>
                                   <h4 className={isDarkMode ? "text-[11px] font-black uppercase italic tracking-tighter leading-tight text-white" : "text-[11px] font-black uppercase italic tracking-tighter leading-tight text-slate-900"}>{s.teams}</h4>
                                   <div className="flex items-center gap-2">
                                      <span className={isDarkMode ? "text-[10px] font-black uppercase italic tracking-tighter text-white" : "text-[10px] font-black uppercase italic tracking-tighter text-slate-600"}>
                                        {s.market}: <span className="text-amber-500">{cleanSelectionText(s.market, s.selection)}</span> 
                                        <span className={isDarkMode ? "ml-2 text-[9px] text-white/50" : "ml-2 text-[9px] text-slate-400"}>@{parseFloat(s.odds || 0).toFixed(2)}</span>
                                      </span>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </section>
        )}

        {activeTab === "historico" && (
          <section className="space-y-6 animate-in">
              <div className="flex flex-col gap-2 px-2">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2 rounded-xl shadow-md"><Trophy size={20} className="text-black" /></div>
                  <h2 className={isDarkMode ? "text-lg font-black uppercase italic tracking-tighter drop-shadow-md text-white" : "text-lg font-black uppercase italic tracking-tighter drop-shadow-md text-slate-900"}>{t('historico')}</h2>
                </div>
                <div className={isDarkMode ? "flex flex-wrap gap-x-4 gap-y-1 py-2 px-3 rounded-2xl border-2 bg-zinc-900/40 border-zinc-800 text-zinc-400" : "flex flex-wrap gap-x-4 gap-y-1 py-2 px-3 rounded-2xl border-2 bg-slate-50 border-slate-200 text-slate-500"}>
                  <span className="text-[10px] font-black uppercase italic tracking-wider">
                    Total vitórias: <span className="text-emerald-500">{ganhos.length}</span>
                  </span>
                  <span className="text-[10px] font-black uppercase italic tracking-wider">
                    Total ganho: <span className="text-emerald-500">{formatNumberWithDots(ganhos.reduce((acc, curr) => {
                      return acc + parseFormattedValue(curr.estimatedReturn);
                    }, 0))} kz</span>
                  </span>
                </div>
              </div>

              <AdSenseBanner isDarkMode={isDarkMode} />

             {loading ? <div className="py-40 flex justify-center"><RefreshCw className="animate-spin text-emerald-500" size={40} /></div> : (
               ganhos.length === 0 ? <div className={isDarkMode ? "py-40 text-center font-black uppercase italic tracking-widest text-lg text-zinc-800" : "py-40 text-center font-black uppercase italic tracking-widest text-lg text-slate-300"}>{t('historicoVazio')}</div> : 
               ganhos.map((a, i) => (
                 <div key={i} className={isDarkMode ? "p-1 rounded-[3rem] border-4 shadow-xl bg-zinc-900/60 border-zinc-800 transition-all" : "p-1 rounded-[3rem] border-4 shadow-xl bg-white border-slate-200 transition-all"}>
                    <div className="p-6 space-y-5">
                       <div className="flex justify-between items-start">
                         <div className="space-y-1 border-l-4 border-emerald-500 pl-3">
                           <h3 className="text-[10px] font-black italic uppercase text-emerald-500 tracking-[0.1em] leading-none">{t('vitoriaIA')} - {a.type}</h3>
                           <span className={isDarkMode ? "text-[8px] font-black uppercase block tracking-widest leading-none text-emerald-500/80" : "text-[8px] font-black uppercase block tracking-widest leading-none text-emerald-500/60"}>{t('resultadoGanho')}</span>
                         </div>
                         <span className="text-[8px] font-black text-zinc-500 uppercase italic">
                           {a.date ? formatDateLong(a.date) : (a.winCertifiedAt ? new Date(a.winCertifiedAt).toLocaleDateString('pt-AO') : "")}
                         </span>
                       </div>
                       <div className={isDarkMode ? "grid grid-cols-2 gap-4 p-4 rounded-[1.5rem] border-2 border-emerald-500/20 bg-emerald-500/5" : "grid grid-cols-2 gap-4 p-4 rounded-[1.5rem] border-2 border-emerald-500/20 bg-emerald-50"}>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2"><span className="text-[9px] font-black text-emerald-500 italic">💰</span> <span className={isDarkMode ? "text-[9px] font-black uppercase tracking-tighter text-white" : "text-[9px] font-black uppercase tracking-tighter text-slate-700"}>{t('stake')}: {formatValueDisplay(a.stake || 0)}</span></div>
                            <div className="flex items-center gap-2"><span className="text-[9px] font-black text-emerald-500 italic">⭐</span> <span className="text-[9px] font-black uppercase text-emerald-500 italic tracking-tighter leading-none">{t('totalWinnings')} : {formatValueDisplay(a.estimatedReturn || 0)}</span></div>
                            <div className="flex items-center gap-2"><span className="text-[9px] font-black text-emerald-500 italic">🚦</span> <span className="text-[9px] font-black uppercase text-emerald-500 italic tracking-tighter leading-none">{a.assertiveness || '90'}% ASSERTIVO</span></div>
                          </div>
                          <div className={isDarkMode ? "flex flex-col items-end justify-center border-l-2 pl-3 border-emerald-500/20" : "flex flex-col items-end justify-center border-l-2 pl-3 border-emerald-500/10"}>
                            <span className="text-[8px] font-black uppercase text-emerald-500/50 block mb-1 tracking-widest leading-none">{t('totalOdds')}</span>
                            <span className="text-3xl font-black italic text-emerald-500 tracking-tighter leading-none">@{typeof a.totalOdds === 'number' ? a.totalOdds.toFixed(2) : parseFloat(String(a.totalOdds || 0)).toFixed(2)}</span>
                          </div>
                       </div>
                       <div className="space-y-4 pt-1">
                          {a.selections.map((s, idx) => (
                            <div key={idx} className={isDarkMode ? "relative pb-4 border-b-2 last:border-0 last:pb-0 border-zinc-800/40 flex justify-between items-center" : "relative pb-4 border-b-2 last:border-0 last:pb-0 border-slate-100 flex justify-between items-center"}>
                               <div className="space-y-1 flex-1 pr-4">
                                 <h4 className={isDarkMode ? "text-[11px] font-black uppercase italic tracking-tighter leading-tight text-white" : "text-[11px] font-black uppercase italic tracking-tighter leading-tight text-slate-900"}>{s.teams}</h4>
                                 <div className="flex items-center gap-2">
                                    <span className={isDarkMode ? "text-[10px] font-black uppercase italic tracking-tighter text-white" : "text-[10px] font-black uppercase italic tracking-tighter text-slate-600"}>
                                      {s.market}: <span className="text-emerald-500">{cleanSelectionText(s.market, s.selection)}</span> 
                                      <span className={isDarkMode ? "ml-2 text-[9px] text-white/50" : "ml-2 text-[9px] text-slate-400"}>@{parseFloat(s.odds || 0).toFixed(2)}</span>
                                    </span>
                                 </div>
                               </div>
                               <span className="text-emerald-500 text-lg flex shrink-0 self-center">✅</span>
                            </div>
                          ))}
                       </div>
                       <div className="pt-3 border-t border-emerald-500/10 text-center">
                          <p className="text-[9px] font-black uppercase italic text-emerald-500/60 tracking-wider">
                            {t('motto')}
                          </p>
                       </div>
                    </div>
                 </div>
               ))
             )}
          </section>
        )}

        {activeTab === "boletim" && (
          <section className="animate-in space-y-6 pb-20">
            <h3 className={isDarkMode ? "text-xl font-black italic uppercase px-3 tracking-tighter text-white" : "text-xl font-black italic uppercase px-3 tracking-tighter text-slate-900"}>{t('boletim').toUpperCase()}</h3>
            <AdSenseBanner isDarkMode={isDarkMode} />
            {betSlip.length === 0 ? <div className={isDarkMode ? "py-40 text-center font-black uppercase italic tracking-widest text-lg text-zinc-800" : "py-40 text-center font-black uppercase italic tracking-widest text-lg text-slate-300"}>{t('vazio')}</div> : 
              <div className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(groupedBetSlip).map(([matchName, selections]: any) => (
                    <div key={matchName} className={isDarkMode ? "p-5 rounded-[1.8rem] border-4 shadow-lg bg-zinc-900/60 border-zinc-800" : "p-5 rounded-[1.8rem] border-4 shadow-lg bg-white border-slate-200"}>
                      <p className="text-[11px] font-black text-amber-500 uppercase italic mb-3 tracking-widest border-b-2 border-amber-500/10 pb-2">{matchName}</p>
                      <div className="space-y-3">
                        {selections.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center animate-in">
                             <div className="leading-tight">
                                <p className={isDarkMode ? "font-black uppercase text-[10px] italic tracking-tighter text-white" : "font-black uppercase text-[10px] italic tracking-tighter text-slate-900"}>{item.market}: <span className="text-amber-500">{cleanSelectionText(item.market, item.selection)}</span></p>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className={isDarkMode ? "font-black text-lg italic tracking-tighter text-white" : "font-black text-lg italic tracking-tighter text-slate-900"}>@{item.odds.toFixed(2)}</span>
                                <button onClick={() => setBetSlip(prev => prev.filter(i => i.id !== item.id))} className={isDarkMode ? "p-1.5 rounded-lg active:scale-90 transition-all text-red-500" : "p-1.5 rounded-lg active:scale-90 transition-all text-red-600"}><Trash2 size={16} /></button>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={isDarkMode ? "p-5 rounded-[1.8rem] border-4 shadow-lg bg-zinc-900/60 border-zinc-800" : "p-5 rounded-[1.8rem] border-4 shadow-lg bg-white border-slate-200"}>
                  <label className="text-[9px] font-black uppercase text-amber-500 block mb-2 tracking-widest">{t('stakeAmount')}</label>
                  <div className="flex items-center gap-3 bg-black/20 rounded-xl p-3 border-2 border-amber-500/30">
                    <DollarSign size={20} className="text-amber-500" />
                    <input type="number" value={manualStake} onChange={(e) => setManualStake(e.target.value)} className={isDarkMode ? "bg-transparent outline-none w-full font-black text-lg text-white" : "bg-transparent outline-none w-full font-black text-lg text-slate-900"} placeholder="0" />
                  </div>
                </div>
                <div className="mt-8 p-8 bg-amber-500 rounded-[2.5rem] text-black shadow-xl border-b-8 border-amber-600">
                   <div className="grid grid-cols-2 gap-4 mb-6 border-b-4 border-black/10 pb-4">
                      <div className="flex flex-col">
                        <span className="font-black uppercase italic text-[10px] tracking-tighter opacity-70">{t('totalOdds').toUpperCase()}</span>
                        <span className="text-3xl font-black tracking-tighter italic leading-none">@{totalBetSlipOdds.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-black uppercase italic text-[10px] tracking-tighter opacity-70">{t('potentialWinnings')}</span>
                        <span className="text-3xl font-black tracking-tighter italic leading-none">{potentialWinningsCalculation} <span className="text-[12px] opacity-60">kz</span></span>
                      </div>
                   </div>
                   <button onClick={() => {
                     const ticket = { id: Date.now(), date: new Date().toLocaleString(), items: [...betSlip], totalOdds: totalBetSlipOdds.toFixed(2), stake: manualStake, winnings: potentialWinningsCalculation };
                     const updated = [ticket, ...savedTickets]; setSavedTickets(updated);
                     localStorage.setItem(`dr_tickets_${user?.uid || user?.username}`, JSON.stringify(updated));
                     setBetSlip([]); setActiveTab("guardados"); addToast(t('saved'));
                   }} className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black uppercase italic text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl border-b-4 border-zinc-800"><Save size={24} /> {t('saved').toUpperCase()}</button>
                </div>
              </div>
            }
          </section>
        )}

        {activeTab === "guardados" && (
          <section className="space-y-6 animate-in pb-20">
             <h3 className={isDarkMode ? "text-xl font-black italic uppercase px-3 tracking-tighter text-white" : "text-xl font-black italic uppercase px-3 tracking-tighter text-slate-900"}>{t('myTickets')}</h3>
             <AdSenseBanner isDarkMode={isDarkMode} />
             {savedTickets.length === 0 ? <div className={isDarkMode ? "py-40 text-center font-black uppercase italic tracking-widest text-lg text-zinc-800" : "py-40 text-center font-black uppercase italic tracking-widest text-lg text-slate-300"}>{t('vazio')}</div> : 
               savedTickets.map(tkt => (
                 <div key={tkt.id} className={isDarkMode ? "p-6 border-4 rounded-[2.5rem] shadow-xl bg-zinc-900/60 border-zinc-800 relative space-y-4" : "p-6 border-4 rounded-[2.5rem] shadow-xl bg-white border-slate-200 relative space-y-4"}>
                    <div className="flex justify-between items-start">
                      <div className={isDarkMode ? "flex items-center gap-2 text-white/50" : "flex items-center gap-2 text-slate-400"}><Calendar size={16} /><span className="text-[9px] font-black uppercase italic tracking-widest">{tkt.date}</span></div>
                      <button onClick={() => { const u = savedTickets.filter(t => t.id !== tkt.id); setSavedTickets(u); localStorage.setItem(`dr_tickets_${user?.uid || user?.username}`, JSON.stringify(u)); }} className={isDarkMode ? "p-2.5 rounded-xl border-2 active:scale-90 transition-all shadow-md bg-red-500/10 text-red-500 border-red-500/20" : "p-2.5 rounded-xl border-2 active:scale-90 transition-all shadow-md bg-red-50 text-red-600 border-red-100"}><Trash2 size={18} /></button>
                    </div>
                    <div className={isDarkMode ? "p-4 rounded-xl space-y-3 bg-black/40" : "p-4 rounded-xl space-y-3 bg-slate-50"}>
                      {tkt.items.map((it: any, idx: number) => (
                        <div key={idx} className={isDarkMode ? "text-[10px] pb-2 border-b last:border-0 border-zinc-800" : "text-[10px] pb-2 border-b last:border-0 border-slate-200"}>
                          <p className="font-black text-amber-500 uppercase">{it.matchName}</p>
                          <p className={isDarkMode ? "font-black opacity-80 text-white" : "font-black opacity-80 text-slate-700"}>{it.market}: {cleanSelectionText(it.market, it.selection)} @{parseFloat(it.odds).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={isDarkMode ? "p-3 rounded-xl border-2 bg-amber-500/5 border-amber-500/20" : "p-3 rounded-xl border-2 bg-amber-50 border-amber-100"}>
                        <span className={isDarkMode ? "text-[8px] font-black uppercase block opacity-50 text-white" : "text-[8px] font-black uppercase block opacity-50 text-slate-600"}>{t('stake').toUpperCase()}</span>
                        <span className="text-sm font-black text-amber-500">{tkt.stake || '0'} kz</span>
                      </div>
                      <div className={isDarkMode ? "p-3 rounded-xl border-2 bg-emerald-500/5 border-emerald-500/20" : "p-3 rounded-xl border-2 bg-emerald-50 border-emerald-100"}>
                        <span className={isDarkMode ? "text-[8px] font-black uppercase block opacity-50 text-white" : "text-[8px] font-black uppercase block opacity-50 text-slate-600"}>{t('totalWinnings').toUpperCase()}</span>
                        <span className="text-sm font-black text-emerald-500">{tkt.winnings || '0'}</span>
                      </div>
                    </div>
                 </div>
               ))
             }
          </section>
        )}

        {activeTab === "chat" && (
          <section className="animate-in flex flex-col h-full overflow-hidden">
            <h3 className={isDarkMode ? "text-xl font-black italic uppercase px-3 tracking-tighter mb-4 shrink-0 leading-none text-white" : "text-xl font-black italic uppercase px-3 tracking-tighter mb-4 shrink-0 leading-none text-slate-900"}>{t('chat')}</h3>
            <div className="shrink-0 px-2">
              <AdSenseBanner isDarkMode={isDarkMode} />
            </div>
            <div className={isDarkMode ? "flex-1 overflow-y-auto p-5 space-y-5 rounded-[2.5rem] border-4 bg-zinc-900/60 border-zinc-800 shadow-inner shadow-black/40" : "flex-1 overflow-y-auto p-5 space-y-5 rounded-[2.5rem] border-4 bg-slate-50 border-slate-200 shadow-inner"}>
              {chatMessages.length === 0 ? <div className="text-center py-40 text-[10px] uppercase font-black opacity-30">{t('noMessages')}</div> :
                chatMessages.map((msg, i) => {
                  const msgDate = new Date(msg.timestamp).toLocaleDateString('pt-AO');
                  const prevMsgDate = i > 0 ? new Date(chatMessages[i - 1].timestamp).toLocaleDateString('pt-AO') : null;
                  const showDateSeparator = msgDate !== prevMsgDate;
                  const timeStr = new Date(msg.timestamp).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <span className="text-[8px] bg-zinc-800/50 text-zinc-400 px-4 py-1 rounded-full uppercase font-black tracking-widest border border-zinc-700/30">
                            {msgDate}
                          </span>
                        </div>
                      )}
                      <div className={`flex gap-4 ${msg.uid === user.uid ? 'flex-row-reverse' : ''} animate-in`}>
                        <div className="w-10 h-10 rounded-full border-2 border-amber-500 overflow-hidden shrink-0 shadow-xl bg-black">
                          {msg.profilePic ? (
                            <img src={msg.profilePic} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                              <User size={20} className="text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div className={`max-w-[80%] space-y-1 ${msg.uid === user.uid ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-2 ${msg.uid === user.uid ? 'flex-row-reverse' : ''}`}>
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">{msg.username}</p>
                            <span className="text-[7px] text-zinc-500 font-bold">{timeStr}</span>
                          </div>
                          <div className={`p-4 rounded-[1.5rem] text-[12px] font-bold leading-relaxed shadow-lg ${msg.uid === user.uid ? 'bg-amber-500 text-black rounded-tr-none' : (isDarkMode ? 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700' : 'bg-white text-slate-900 rounded-tl-none border border-slate-100')}`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              }
              <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex gap-3 pb-24 shrink-0">
               <input 
                 type="text" 
                 value={chatInput} 
                 onChange={e => setChatInput(e.target.value)} 
                 onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                 placeholder={t('typeMessage')}
                 className={isDarkMode ? "flex-1 p-5 rounded-[1.8rem] font-black text-[13px] border-4 focus:border-amber-500 transition-all bg-zinc-900 border-zinc-800 text-white" : "flex-1 p-5 rounded-[1.8rem] font-black text-[13px] border-4 focus:border-amber-500 transition-all bg-white border-slate-200 text-slate-900 shadow-md"} 
               />
               <button onClick={handleSendMessage} className="bg-amber-500 text-black px-6 rounded-[1.8rem] shadow-xl active:scale-90 transition-all flex items-center justify-center shrink-0"><Send size={28} /></button>
            </div>
          </section>
        )}
      </main>

      <nav className={isDarkMode ? "fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[550px] p-2 rounded-[3.5rem] flex gap-1 z-50 border-4 shadow-2xl transition-all bg-amber-500 border-amber-600/50" : "fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[550px] p-2 rounded-[3.5rem] flex gap-1 z-50 border-4 shadow-2xl transition-all bg-black border-zinc-800"}>
        {[
          { id: 'hoje', icon: LayoutDashboard, label: t('palpites') },
          { id: 'acumulador', icon: Layers, label: t('fichas') },
          { id: 'historico', icon: Trophy, label: t('historico') },
          { id: 'chat', icon: MessageCircle, label: t('chat') },
          { id: 'boletim', icon: Ticket, label: t('boletim'), count: betSlip.length },
          { id: 'guardados', icon: Save, label: t('guardados') }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-4 rounded-[3rem] flex flex-col items-center gap-1.5 transition-all relative ${activeTab === tab.id ? 'bg-white/20' : ''}`}>
            <tab.icon size={18} className="text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,1)]" strokeWidth={3} />
            <span className="text-[6.5px] uppercase font-black tracking-tighter leading-none text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,1)]">{tab.label}</span>
            {tab.count ? <span className="absolute top-1 right-1 bg-red-600 text-white text-[7px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white font-black animate-pulse">{tab.count}</span> : null}
          </button>
        ))}
      </nav>

      {activeAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-[320px] shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-5 text-center border-4 border-amber-500">
            <div className="mx-auto bg-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 border-black">
              <Bell size={32} className="text-black animate-bounce" />
            </div>
            <div className="space-y-3">
              <h3 className="text-black font-black text-2xl italic uppercase tracking-tighter leading-none">{activeAlert.titulo}</h3>
              <p className="text-zinc-600 font-bold text-[13px] leading-relaxed italic uppercase border-t-2 border-zinc-100 pt-3">{activeAlert.mensagem}</p>
            </div>
            <button 
              onClick={async () => {
                try {
                  await update(ref(db, "Alerta/chave"), { mostrar: "false" });
                  if (activeAlert.token) localStorage.setItem("dr_dismissed_alert", activeAlert.token);
                } catch {}
                setActiveAlert(null);
              }}
              className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase italic tracking-widest active:scale-95 transition-all shadow-xl border-b-4 border-zinc-800"
            >{t('ok')}</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .marquee-wrapper { animation: marquee 70s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        ::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; outline: none; }
        body { overflow-x: hidden; -webkit-font-smoothing: antialiased; font-family: 'Inter', sans-serif; font-weight: 900; background-color: ${isDarkMode ? '#020617' : '#ffffff'}; font-size: 13px; }
        input::placeholder { font-weight: 900; opacity: 1; color: #4b5563; }
        select { -webkit-appearance: none; appearance: none; cursor: pointer; border: none; }
        option { background: #000; color: #fff; font-weight: 900; }
        .marquee-content { white-space: nowrap; }
      `}} />

      {/* 24-HOUR ACCESS OFFERWALL OVERLAY */}
      {!isNormalModeUnlocked && user && (
        <div className="fixed inset-0 z-[150] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-md space-y-8 text-center animate-in">
            {/* Dr. Palpites Header branding */}
            <div className="space-y-4">
              <div className="w-24 h-24 rounded-[2.5rem] mx-auto overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] border-4 border-amber-500 flex items-center justify-center bg-black">
                <img src={appConfig.logoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                  DR <span className="text-amber-500">PALPITES</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic mt-2">
                  Não aposta na sorte...aposta na ciência.!!
                </p>
              </div>
            </div>

            {/* Main Offerwall layout following strict user guidelines */}
            <div className="bg-zinc-900/90 border-4 border-zinc-800 rounded-[3rem] p-6 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-3 right-5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[7px] font-black tracking-widest text-zinc-500 uppercase">AdSense Offerwall</span>
              </div>

              <div className="space-y-2 pt-2">
                <h2 className="text-2xl font-black italic uppercase text-amber-500 tracking-tight leading-none">Welcome to Dr. PALPITES</h2>
                <h3 className="text-xs font-black uppercase text-white tracking-widest">Unlock more content</h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider leading-relaxed">
                  Take action to continue accessing the content on this site
                </p>
              </div>

              <div className="space-y-3">
                {/* Option 1: View short ad */}
                <div className="p-4 rounded-[1.8rem] border-4 border-zinc-800 bg-black/50 text-left space-y-3.5 hover:border-amber-500/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[12px] font-black uppercase text-white tracking-tight">View a short ad</h4>
                      <p className="text-[9px] font-black text-zinc-500 uppercase italic">Site-wide access for 24 hours...</p>
                    </div>
                    <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full font-black border border-amber-500/20">GRÁTIS</span>
                  </div>
                  <button 
                    onClick={() => startAdPlayback("normal")}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-[1.2rem] text-[10px] uppercase italic flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 border-b-4 border-amber-600"
                  >
                    🔓 DESBLOQUEAR GRÁTIS DE 24H
                  </button>
                </div>

                {/* Option 2: VIP Access */}
                <div className="p-4 rounded-[1.8rem] border-4 border-zinc-800 bg-zinc-950/40 text-left space-y-3.5 hover:border-amber-500/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[12px] font-black uppercase text-amber-500 tracking-tight">Adquirir Acesso VIP</h4>
                      <p className="text-[9px] font-black text-zinc-500 uppercase italic">Acesso ilimitado instantâneo sem nenhum anúncio</p>
                    </div>
                    <span className="text-[9px] bg-amber-500 text-black px-2.5 py-1 rounded-full font-black">👑 VIP</span>
                  </div>
                  <a 
                    href={appConfig.loja}
                    target="_blank"
                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-amber-500 border-2 border-amber-500/30 font-black py-4 rounded-[1.2rem] text-[10px] uppercase italic flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    👑 ADQUIRIR MEMBRESIA VIP
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={() => {
                  setUser(null);
                  localStorage.removeItem("dr_user");
                }}
                className="text-[10px] font-black text-zinc-600 hover:text-white uppercase italic tracking-widest transition-colors flex items-center gap-1"
              >
                <LogOut size={12} /> {t('logout').toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REWARDED AD VIDEO PLAYER SIMULATOR */}
      {isAdPlaying && (
        <div className="fixed inset-0 z-[200] bg-black/98 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 rounded-[3rem] border-4 border-zinc-800 overflow-hidden shadow-2xl relative flex flex-col aspect-[9/16]">
            {/* Top Indicator bar */}
            <div className="p-4 bg-black/60 border-b border-zinc-900 flex justify-between items-center text-[9px] font-black uppercase text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-white tracking-widest">PATROCINADO</span>
              </div>
              <button 
                onClick={() => setAdMuted(!adMuted)}
                className="p-1.5 hover:bg-zinc-900 rounded-lg transition-colors text-white"
              >
                {adMuted ? "🔇 MUTED" : "🔊 AUDIO"}
              </button>
            </div>

            {/* Interactive Video Body */}
            <div className={`flex-1 p-6 bg-gradient-to-b ${MOCK_ADS[currentAdIndex].bgGradient} flex flex-col justify-between items-center text-center relative overflow-hidden`}>
              {/* Background ambient animations */}
              <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                <div className="w-72 h-72 rounded-full bg-white animate-pulse" />
              </div>

              {/* Ad Logo area */}
              <div className="pt-8 space-y-3 z-10">
                <div className="w-20 h-20 rounded-[2rem] bg-black/80 border-4 border-amber-500 flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-3xl">🎮</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none">
                  {MOCK_ADS[currentAdIndex].title}
                </h3>
                <span className="inline-block bg-black/60 text-amber-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/20">
                  {MOCK_ADS[currentAdIndex].subtitle}
                </span>
              </div>

              {/* Ad message */}
              <div className="px-4 py-6 bg-black/50 backdrop-blur-sm rounded-[2rem] border-2 border-zinc-800/50 max-w-[280px] z-10 space-y-2">
                <p className="text-[11px] font-black text-zinc-300 leading-relaxed uppercase">
                  {MOCK_ADS[currentAdIndex].description}
                </p>
                <button className="bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest py-2.5 px-6 rounded-full italic hover:scale-105 transition-transform">
                  {MOCK_ADS[currentAdIndex].cta}
                </button>
              </div>

              {/* Status footer */}
              <div className="w-full z-10 space-y-3">
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic animate-bounce">
                  O seu palpite científico está a ser calculado pela IA do Dr. Palpites...
                </p>
              </div>
            </div>

            {/* Progress and Countdown controller bar */}
            <div className="p-6 bg-zinc-950 border-t border-zinc-900 space-y-4">
              {/* Progress bar */}
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000"
                  style={{ width: `${((5 - adSecondsLeft) / 5) * 100}%` }}
                />
              </div>

              {/* Action buttons */}
              {adComplete ? (
                <button 
                  onClick={handleClaimAdReward}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-[1.5rem] text-[11px] uppercase italic tracking-wider flex items-center justify-center gap-2 shadow-xl border-b-4 border-emerald-600 animate-bounce"
                >
                  🎁 RESGATAR RECOMPENSA & FECHAR
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-zinc-500 py-3">
                  <span className="animate-spin h-3 w-3 border-2 border-amber-500 border-t-transparent rounded-full" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Assista para ganhar recompensa ({adSecondsLeft}s)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] space-y-2 w-[90%] max-w-[300px]">
        {toasts.map(toast => (
          <div key={toast.id} className={`p-4 rounded-[1.2rem] shadow-2xl border-2 flex items-center justify-center gap-3 animate-in ${toast.type === 'error' ? 'bg-red-500 border-red-600 text-white' : 'bg-emerald-500 border-emerald-600 text-white'}`}>
            <span className="text-[10px] font-black uppercase italic tracking-widest">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const mountApp = () => {
  const container = document.getElementById("root");
  if (container) {
    const root = (container as any)._reactRoot || ReactDOM.createRoot(container);
    (container as any)._reactRoot = root;
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <FirebaseProvider>
            <App />
          </FirebaseProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  }
};
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', mountApp) : mountApp();
