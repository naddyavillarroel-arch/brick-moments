import Storage from 'expo-sqlite/kv-store';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export const LANGS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'zh', label: '中文' },
  { code: 'de', label: 'Deutsch' },
] as const;
export type Lang = (typeof LANGS)[number]['code'];

const es = {
  'tab.calendar': 'Calendario', 'tab.recent': 'Recientes', 'tab.favorites': 'Favoritos', 'tab.report': 'Reporte',
  'common.cancel': 'Cancelar', 'common.delete': 'Eliminar',
  'home.hint': 'Toca un día para ver o añadir momentos',
  'day.empty': 'Sin momentos este día.', 'day.add': '+ Añadir momento',
  'recent.empty': 'Aún no tienes momentos. ¡Crea el primero desde el calendario!',
  'fav.empty': 'Marca momentos como favoritos para verlos aquí.',
  'moment.new': 'Nuevo momento', 'moment.edit': 'Editar momento',
  'moment.name': 'Nombre del momento', 'moment.namePh': 'Mi primer set',
  'moment.fav': 'Marcar como favorito', 'moment.isFav': 'Es uno de tus favoritos',
  'moment.photos': 'Fotos', 'moment.camera': 'Cámara', 'moment.gallery': 'Galería',
  'moment.detail': 'Detalle', 'moment.detailPh': '¿Qué pasó este día?',
  'moment.setNum': 'Número de set (opcional)', 'moment.setPh': 'ej. 10294',
  'moment.save': 'Guardar', 'moment.share': 'Compartir como postal', 'moment.delete': 'Eliminar momento',
  'moment.needName': 'Falta el nombre', 'moment.needNameMsg': 'Ponle un nombre a tu momento (ej. "Mi primer set").',
  'moment.rmPhoto': 'Quitar foto', 'moment.rmPhotoMsg': '¿Eliminar esta foto del momento?',
  'moment.delTitle': 'Eliminar momento', 'moment.delMsg': 'Se borrará este momento y sus fotos. ¿Continuar?',
  'moment.camPerm': 'Necesitamos permiso de la cámara para tomar fotos.',
  'rep.moments': 'Momentos', 'rep.days': 'Días con recuerdos', 'rep.photos': 'Fotos', 'rep.favs': 'Favoritos',
  'rep.filters': 'Filtros', 'rep.year': 'Año', 'rep.month': 'Mes', 'rep.all': 'Todos',
  'list.shareCard': 'Compartir tarjeta', 'rep.clear': 'Limpiar filtros', 'rep.onlyFav': '⭐ Favoritos', 'rep.top': '🏆 Mes con más momentos',
  'rep.topVal': 'Mes con más momentos: {m} {y} ({n})',
  'rep.byMonth': 'Momentos por mes', 'rep.results': 'Resultados ({n})', 'rep.none': 'No hay momentos con estos filtros.',
  'post.share': 'Compartir', 'post.fail': 'No se pudo compartir',
  'set.title': 'Ajustes', 'set.lang': 'Idioma', 'set.backup': 'Respaldo de datos',
  'set.backupInfo': 'Crea un archivo ZIP con todos tus momentos y fotos. Guárdalo en Google Drive, en tu correo o en tu PC para no perder nada si cambias de teléfono o desinstalas la app.',
  'set.export': 'Crear respaldo (ZIP)', 'set.import': 'Restaurar desde un respaldo',
  'set.imported': '{n} momentos restaurados.', 'set.importErr': 'No se pudo leer ese archivo.', 'set.exportErr': 'No se pudo crear el respaldo.',
  'set.album': 'Galería del teléfono',
  'set.albumInfo': 'Tus fotos ya se guardan dentro de la app. Opcionalmente puedes tener una copia en el álbum "Brick Moments" de tu galería.',
  'set.autoAlbum': 'Guardar las fotos de la cámara en el álbum', 'set.exportAlbum': 'Copiar todas mis fotos al álbum',
  'set.albumDone': '{n} fotos copiadas al álbum.', 'set.noPerm': 'Sin permiso para acceder a la galería.',
};
type Key = keyof typeof es;
type Dict = Record<Key, string>;

const en: Dict = {
  'tab.calendar': 'Calendar', 'tab.recent': 'Recent', 'tab.favorites': 'Favorites', 'tab.report': 'Report',
  'common.cancel': 'Cancel', 'common.delete': 'Delete',
  'home.hint': 'Tap a day to see or add moments',
  'day.empty': 'No moments on this day.', 'day.add': '+ Add moment',
  'recent.empty': "You don't have any moments yet. Create the first one from the calendar!",
  'fav.empty': 'Mark moments as favorites to see them here.',
  'moment.new': 'New moment', 'moment.edit': 'Edit moment',
  'moment.name': 'Moment name', 'moment.namePh': 'My first set',
  'moment.fav': 'Mark as favorite', 'moment.isFav': "It's one of your favorites",
  'moment.photos': 'Photos', 'moment.camera': 'Camera', 'moment.gallery': 'Gallery',
  'moment.detail': 'Details', 'moment.detailPh': 'What happened this day?',
  'moment.setNum': 'Set number (optional)', 'moment.setPh': 'e.g. 10294',
  'moment.save': 'Save', 'moment.share': 'Share as postcard', 'moment.delete': 'Delete moment',
  'moment.needName': 'Name is missing', 'moment.needNameMsg': 'Give your moment a name (e.g. "My first set").',
  'moment.rmPhoto': 'Remove photo', 'moment.rmPhotoMsg': 'Remove this photo from the moment?',
  'moment.delTitle': 'Delete moment', 'moment.delMsg': 'This moment and its photos will be deleted. Continue?',
  'moment.camPerm': 'We need camera permission to take photos.',
  'rep.moments': 'Moments', 'rep.days': 'Days with memories', 'rep.photos': 'Photos', 'rep.favs': 'Favorites',
  'rep.filters': 'Filters', 'rep.year': 'Year', 'rep.month': 'Month', 'rep.all': 'All',
  'list.shareCard': 'Share card', 'rep.clear': 'Clear filters', 'rep.onlyFav': '⭐ Favorites', 'rep.top': '🏆 Month with most moments',
  'rep.topVal': 'Month with most moments: {m} {y} ({n})',
  'rep.byMonth': 'Moments per month', 'rep.results': 'Results ({n})', 'rep.none': 'No moments match these filters.',
  'post.share': 'Share', 'post.fail': "Couldn't share",
  'set.title': 'Settings', 'set.lang': 'Language', 'set.backup': 'Data backup',
  'set.backupInfo': 'Creates a ZIP file with all your moments and photos. Save it to Google Drive, your email or your PC so you lose nothing if you change phones or uninstall the app.',
  'set.export': 'Create backup (ZIP)', 'set.import': 'Restore from a backup',
  'set.imported': '{n} moments restored.', 'set.importErr': "That file couldn't be read.", 'set.exportErr': "The backup couldn't be created.",
  'set.album': 'Phone gallery',
  'set.albumInfo': 'Your photos are already stored inside the app. Optionally you can keep a copy in the "Brick Moments" album of your gallery.',
  'set.autoAlbum': 'Save camera photos to the album', 'set.exportAlbum': 'Copy all my photos to the album',
  'set.albumDone': '{n} photos copied to the album.', 'set.noPerm': 'No permission to access the gallery.',
};

const pt: Dict = {
  'tab.calendar': 'Calendário', 'tab.recent': 'Recentes', 'tab.favorites': 'Favoritos', 'tab.report': 'Relatório',
  'common.cancel': 'Cancelar', 'common.delete': 'Excluir',
  'home.hint': 'Toque em um dia para ver ou adicionar momentos',
  'day.empty': 'Sem momentos neste dia.', 'day.add': '+ Adicionar momento',
  'recent.empty': 'Você ainda não tem momentos. Crie o primeiro pelo calendário!',
  'fav.empty': 'Marque momentos como favoritos para vê-los aqui.',
  'moment.new': 'Novo momento', 'moment.edit': 'Editar momento',
  'moment.name': 'Nome do momento', 'moment.namePh': 'Meu primeiro set',
  'moment.fav': 'Marcar como favorito', 'moment.isFav': 'É um dos seus favoritos',
  'moment.photos': 'Fotos', 'moment.camera': 'Câmera', 'moment.gallery': 'Galeria',
  'moment.detail': 'Detalhes', 'moment.detailPh': 'O que aconteceu neste dia?',
  'moment.setNum': 'Número do set (opcional)', 'moment.setPh': 'ex. 10294',
  'moment.save': 'Salvar', 'moment.share': 'Compartilhar como cartão-postal', 'moment.delete': 'Excluir momento',
  'moment.needName': 'Falta o nome', 'moment.needNameMsg': 'Dê um nome ao seu momento (ex. "Meu primeiro set").',
  'moment.rmPhoto': 'Remover foto', 'moment.rmPhotoMsg': 'Remover esta foto do momento?',
  'moment.delTitle': 'Excluir momento', 'moment.delMsg': 'Este momento e suas fotos serão apagados. Continuar?',
  'moment.camPerm': 'Precisamos de permissão da câmera para tirar fotos.',
  'rep.moments': 'Momentos', 'rep.days': 'Dias com lembranças', 'rep.photos': 'Fotos', 'rep.favs': 'Favoritos',
  'rep.filters': 'Filtros', 'rep.year': 'Ano', 'rep.month': 'Mês', 'rep.all': 'Todos',
  'list.shareCard': 'Compartilhar cartão', 'rep.clear': 'Limpar filtros', 'rep.onlyFav': '⭐ Favoritos', 'rep.top': '🏆 Mês com mais momentos',
  'rep.topVal': 'Mês com mais momentos: {m} {y} ({n})',
  'rep.byMonth': 'Momentos por mês', 'rep.results': 'Resultados ({n})', 'rep.none': 'Nenhum momento com estes filtros.',
  'post.share': 'Compartilhar', 'post.fail': 'Não foi possível compartilhar',
  'set.title': 'Ajustes', 'set.lang': 'Idioma', 'set.backup': 'Backup de dados',
  'set.backupInfo': 'Cria um arquivo ZIP com todos os seus momentos e fotos. Guarde-o no Google Drive, no e-mail ou no PC para não perder nada se trocar de celular ou desinstalar o app.',
  'set.export': 'Criar backup (ZIP)', 'set.import': 'Restaurar de um backup',
  'set.imported': '{n} momentos restaurados.', 'set.importErr': 'Não foi possível ler esse arquivo.', 'set.exportErr': 'Não foi possível criar o backup.',
  'set.album': 'Galeria do celular',
  'set.albumInfo': 'Suas fotos já ficam guardadas dentro do app. Opcionalmente, você pode ter uma cópia no álbum "Brick Moments" da galeria.',
  'set.autoAlbum': 'Salvar as fotos da câmera no álbum', 'set.exportAlbum': 'Copiar todas as minhas fotos para o álbum',
  'set.albumDone': '{n} fotos copiadas para o álbum.', 'set.noPerm': 'Sem permissão para acessar a galeria.',
};

const fr: Dict = {
  'tab.calendar': 'Calendrier', 'tab.recent': 'Récents', 'tab.favorites': 'Favoris', 'tab.report': 'Bilan',
  'common.cancel': 'Annuler', 'common.delete': 'Supprimer',
  'home.hint': 'Touchez un jour pour voir ou ajouter des moments',
  'day.empty': 'Aucun moment ce jour-là.', 'day.add': '+ Ajouter un moment',
  'recent.empty': "Vous n'avez pas encore de moments. Créez le premier depuis le calendrier !",
  'fav.empty': 'Marquez des moments comme favoris pour les voir ici.',
  'moment.new': 'Nouveau moment', 'moment.edit': 'Modifier le moment',
  'moment.name': 'Nom du moment', 'moment.namePh': 'Mon premier set',
  'moment.fav': 'Marquer comme favori', 'moment.isFav': "C'est l'un de vos favoris",
  'moment.photos': 'Photos', 'moment.camera': 'Appareil photo', 'moment.gallery': 'Galerie',
  'moment.detail': 'Détails', 'moment.detailPh': "Que s'est-il passé ce jour-là ?",
  'moment.setNum': 'Numéro du set (facultatif)', 'moment.setPh': 'ex. 10294',
  'moment.save': 'Enregistrer', 'moment.share': 'Partager en carte postale', 'moment.delete': 'Supprimer le moment',
  'moment.needName': 'Nom manquant', 'moment.needNameMsg': 'Donnez un nom à votre moment (ex. « Mon premier set »).',
  'moment.rmPhoto': 'Retirer la photo', 'moment.rmPhotoMsg': 'Retirer cette photo du moment ?',
  'moment.delTitle': 'Supprimer le moment', 'moment.delMsg': 'Ce moment et ses photos seront supprimés. Continuer ?',
  'moment.camPerm': "Nous avons besoin de l'autorisation de l'appareil photo.",
  'rep.moments': 'Moments', 'rep.days': 'Jours avec souvenirs', 'rep.photos': 'Photos', 'rep.favs': 'Favoris',
  'rep.filters': 'Filtres', 'rep.year': 'Année', 'rep.month': 'Mois', 'rep.all': 'Tous',
  'list.shareCard': 'Partager la carte', 'rep.clear': 'Effacer les filtres', 'rep.onlyFav': '⭐ Favoris', 'rep.top': '🏆 Mois avec le plus de moments',
  'rep.topVal': 'Mois avec le plus de moments : {m} {y} ({n})',
  'rep.byMonth': 'Moments par mois', 'rep.results': 'Résultats ({n})', 'rep.none': 'Aucun moment avec ces filtres.',
  'post.share': 'Partager', 'post.fail': 'Partage impossible',
  'set.title': 'Réglages', 'set.lang': 'Langue', 'set.backup': 'Sauvegarde des données',
  'set.backupInfo': "Crée un fichier ZIP avec tous vos moments et photos. Gardez-le sur Google Drive, par e-mail ou sur votre PC pour ne rien perdre si vous changez de téléphone ou désinstallez l'appli.",
  'set.export': 'Créer une sauvegarde (ZIP)', 'set.import': 'Restaurer depuis une sauvegarde',
  'set.imported': '{n} moments restaurés.', 'set.importErr': 'Impossible de lire ce fichier.', 'set.exportErr': 'Impossible de créer la sauvegarde.',
  'set.album': 'Galerie du téléphone',
  'set.albumInfo': "Vos photos sont déjà stockées dans l'appli. Vous pouvez aussi en garder une copie dans l'album « Brick Moments » de votre galerie.",
  'set.autoAlbum': "Enregistrer les photos de l'appareil dans l'album", 'set.exportAlbum': "Copier toutes mes photos dans l'album",
  'set.albumDone': "{n} photos copiées dans l'album.", 'set.noPerm': "Pas d'autorisation pour accéder à la galerie.",
};

const zh: Dict = {
  'tab.calendar': '日历', 'tab.recent': '最近', 'tab.favorites': '收藏', 'tab.report': '统计',
  'common.cancel': '取消', 'common.delete': '删除',
  'home.hint': '点击某一天查看或添加时刻',
  'day.empty': '这一天还没有时刻。', 'day.add': '+ 添加时刻',
  'recent.empty': '你还没有任何时刻。从日历里创建第一个吧！',
  'fav.empty': '把时刻标记为收藏，就会显示在这里。',
  'moment.new': '新时刻', 'moment.edit': '编辑时刻',
  'moment.name': '时刻名称', 'moment.namePh': '我的第一套积木',
  'moment.fav': '标记为收藏', 'moment.isFav': '这是你的收藏之一',
  'moment.photos': '照片', 'moment.camera': '相机', 'moment.gallery': '相册',
  'moment.detail': '详情', 'moment.detailPh': '这一天发生了什么？',
  'moment.setNum': '套装编号（可选）', 'moment.setPh': '例如 10294',
  'moment.save': '保存', 'moment.share': '分享为明信片', 'moment.delete': '删除时刻',
  'moment.needName': '缺少名称', 'moment.needNameMsg': '请给这个时刻起个名字（例如“我的第一套积木”）。',
  'moment.rmPhoto': '移除照片', 'moment.rmPhotoMsg': '要从这个时刻中移除这张照片吗？',
  'moment.delTitle': '删除时刻', 'moment.delMsg': '这个时刻及其照片将被删除。要继续吗？',
  'moment.camPerm': '拍照需要相机权限。',
  'rep.moments': '时刻', 'rep.days': '有记忆的天数', 'rep.photos': '照片', 'rep.favs': '收藏',
  'rep.filters': '筛选', 'rep.year': '年份', 'rep.month': '月份', 'rep.all': '全部',
  'list.shareCard': '分享卡片', 'rep.clear': '清除筛选', 'rep.onlyFav': '⭐ 收藏', 'rep.top': '🏆 时刻最多的月份',
  'rep.topVal': '时刻最多的月份：{y}年{m}（{n}）',
  'rep.byMonth': '每月时刻数', 'rep.results': '结果（{n}）', 'rep.none': '没有符合这些筛选条件的时刻。',
  'post.share': '分享', 'post.fail': '无法分享',
  'set.title': '设置', 'set.lang': '语言', 'set.backup': '数据备份',
  'set.backupInfo': '创建包含所有时刻和照片的 ZIP 文件。把它保存到 Google Drive、邮箱或电脑，换手机或卸载应用时就不会丢失数据。',
  'set.export': '创建备份（ZIP）', 'set.import': '从备份恢复',
  'set.imported': '已恢复 {n} 个时刻。', 'set.importErr': '无法读取该文件。', 'set.exportErr': '无法创建备份。',
  'set.album': '手机相册',
  'set.albumInfo': '你的照片已保存在应用内部。你也可以在相册中的“Brick Moments”相簿里保留一份副本。',
  'set.autoAlbum': '将相机拍摄的照片保存到相簿', 'set.exportAlbum': '把我的所有照片复制到相簿',
  'set.albumDone': '已复制 {n} 张照片到相簿。', 'set.noPerm': '没有访问相册的权限。',
};

const de: Dict = {
  'tab.calendar': 'Kalender', 'tab.recent': 'Zuletzt', 'tab.favorites': 'Favoriten', 'tab.report': 'Bericht',
  'common.cancel': 'Abbrechen', 'common.delete': 'Löschen',
  'home.hint': 'Tippe auf einen Tag, um Momente zu sehen oder hinzuzufügen',
  'day.empty': 'Keine Momente an diesem Tag.', 'day.add': '+ Moment hinzufügen',
  'recent.empty': 'Du hast noch keine Momente. Erstelle den ersten im Kalender!',
  'fav.empty': 'Markiere Momente als Favoriten, um sie hier zu sehen.',
  'moment.new': 'Neuer Moment', 'moment.edit': 'Moment bearbeiten',
  'moment.name': 'Name des Moments', 'moment.namePh': 'Mein erstes Set',
  'moment.fav': 'Als Favorit markieren', 'moment.isFav': 'Einer deiner Favoriten',
  'moment.photos': 'Fotos', 'moment.camera': 'Kamera', 'moment.gallery': 'Galerie',
  'moment.detail': 'Details', 'moment.detailPh': 'Was ist an diesem Tag passiert?',
  'moment.setNum': 'Set-Nummer (optional)', 'moment.setPh': 'z. B. 10294',
  'moment.save': 'Speichern', 'moment.share': 'Als Postkarte teilen', 'moment.delete': 'Moment löschen',
  'moment.needName': 'Name fehlt', 'moment.needNameMsg': 'Gib deinem Moment einen Namen (z. B. „Mein erstes Set“).',
  'moment.rmPhoto': 'Foto entfernen', 'moment.rmPhotoMsg': 'Dieses Foto aus dem Moment entfernen?',
  'moment.delTitle': 'Moment löschen', 'moment.delMsg': 'Dieser Moment und seine Fotos werden gelöscht. Fortfahren?',
  'moment.camPerm': 'Wir brauchen die Kameraberechtigung, um Fotos aufzunehmen.',
  'rep.moments': 'Momente', 'rep.days': 'Tage mit Erinnerungen', 'rep.photos': 'Fotos', 'rep.favs': 'Favoriten',
  'rep.filters': 'Filter', 'rep.year': 'Jahr', 'rep.month': 'Monat', 'rep.all': 'Alle',
  'list.shareCard': 'Karte teilen', 'rep.clear': 'Filter zurücksetzen', 'rep.onlyFav': '⭐ Favoriten', 'rep.top': '🏆 Monat mit den meisten Momenten',
  'rep.topVal': 'Monat mit den meisten Momenten: {m} {y} ({n})',
  'rep.byMonth': 'Momente pro Monat', 'rep.results': 'Ergebnisse ({n})', 'rep.none': 'Keine Momente für diese Filter.',
  'post.share': 'Teilen', 'post.fail': 'Teilen nicht möglich',
  'set.title': 'Einstellungen', 'set.lang': 'Sprache', 'set.backup': 'Datensicherung',
  'set.backupInfo': 'Erstellt eine ZIP-Datei mit allen Momenten und Fotos. Speichere sie in Google Drive, per E-Mail oder auf dem PC, damit nichts verloren geht, wenn du das Handy wechselst oder die App löschst.',
  'set.export': 'Sicherung erstellen (ZIP)', 'set.import': 'Aus Sicherung wiederherstellen',
  'set.imported': '{n} Momente wiederhergestellt.', 'set.importErr': 'Diese Datei konnte nicht gelesen werden.', 'set.exportErr': 'Die Sicherung konnte nicht erstellt werden.',
  'set.album': 'Handy-Galerie',
  'set.albumInfo': 'Deine Fotos werden bereits in der App gespeichert. Optional kannst du eine Kopie im Album „Brick Moments“ deiner Galerie behalten.',
  'set.autoAlbum': 'Kamerafotos im Album speichern', 'set.exportAlbum': 'Alle meine Fotos ins Album kopieren',
  'set.albumDone': '{n} Fotos ins Album kopiert.', 'set.noPerm': 'Keine Berechtigung für die Galerie.',
};

const DICTS: Record<Lang, Dict> = { es, en, pt, fr, zh, de };

const MONTHS: Record<Lang, string[]> = {
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  pt: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  zh: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
};
const FR_SHORT = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];
const WEEK: Record<Lang, string[]> = {
  es: ['L','M','X','J','V','S','D'], en: ['M','T','W','T','F','S','S'], pt: ['S','T','Q','Q','S','S','D'],
  fr: ['L','M','M','J','V','S','D'], zh: ['一','二','三','四','五','六','日'], de: ['M','D','M','D','F','S','S'],
};
const DATE_FMT: Record<Lang, string> = {
  es: '{d} de {m} de {y}', en: '{m} {d}, {y}', pt: '{d} de {m} de {y}',
  fr: '{d} {m} {y}', zh: '{y}年{m}{d}日', de: '{d}. {m} {y}',
};

function detect(): Lang {
  try {
    const saved = Storage.getItemSync('lang');
    if (saved && saved in DICTS) return saved as Lang;
    const loc = Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2);
    if (loc in DICTS) return loc as Lang;
  } catch {}
  return 'en';
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key, vars?: Record<string, string | number>) => string;
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  fmt: (date: string) => string;
  monthTitle: (y: number, m: number) => string;
};
const I18nContext = createContext<Ctx>(null as unknown as Ctx);
export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect);

  const value = useMemo<Ctx>(() => {
    const months = MONTHS[lang];
    return {
      lang,
      setLang: (l) => { setLangState(l); try { Storage.setItemSync('lang', l); } catch {} },
      t: (k, vars) => {
        let s = DICTS[lang][k];
        if (vars) for (const x in vars) s = s.replace(`{${x}}`, String(vars[x]));
        return s;
      },
      months,
      monthsShort: lang === 'fr' ? FR_SHORT : lang === 'zh' ? months : months.map((m) => m.slice(0, 3)),
      weekdays: WEEK[lang],
      fmt: (date) => {
        const [y, m, d] = date.split('-').map(Number);
        return DATE_FMT[lang].replace('{d}', String(d)).replace('{m}', months[m - 1]).replace('{y}', String(y));
      },
      monthTitle: (y, m) => (lang === 'zh' ? `${y}年${months[m]}` : `${months[m]} ${y}`),
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
