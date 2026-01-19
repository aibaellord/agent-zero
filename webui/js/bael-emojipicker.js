/**
 * BAEL Emoji Picker Component - Lord Of All Emotions
 *
 * Emoji selection:
 * - Categorized emojis
 * - Search functionality
 * - Recently used
 * - Skin tone selector
 * - Native or image emojis
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // EMOJI DATA
  // ============================================================

  const EMOJI_CATEGORIES = {
    recent: { name: "Recent", icon: "🕒", emojis: [] },
    smileys: {
      name: "Smileys & Emotion",
      icon: "😀",
      emojis: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "🤣",
        "😂",
        "🙂",
        "🙃",
        "😉",
        "😊",
        "😇",
        "🥰",
        "😍",
        "🤩",
        "😘",
        "😗",
        "☺️",
        "😚",
        "😋",
        "😛",
        "😜",
        "🤪",
        "😝",
        "🤑",
        "🤗",
        "🤭",
        "🤫",
        "🤔",
        "🤐",
        "🤨",
        "😐",
        "😑",
        "😶",
        "😏",
        "😒",
        "🙄",
        "😬",
        "🤥",
        "😌",
        "😔",
        "😪",
        "🤤",
        "😴",
        "😷",
        "🤒",
        "🤕",
        "🤢",
        "🤮",
        "🤧",
        "🥵",
        "🥶",
        "🥴",
        "😵",
        "🤯",
        "🤠",
        "🥳",
        "🥸",
        "😎",
        "🤓",
        "🧐",
        "😕",
        "😟",
        "🙁",
        "☹️",
        "😮",
        "😯",
        "😲",
        "😳",
        "🥺",
        "😦",
        "😧",
        "😨",
        "😰",
        "😥",
        "😢",
        "😭",
        "😱",
        "😖",
        "😣",
        "😞",
        "😓",
        "😩",
        "😫",
        "🥱",
        "😤",
        "😡",
        "😠",
        "🤬",
        "😈",
        "👿",
        "💀",
        "☠️",
        "💩",
        "🤡",
        "👹",
        "👺",
        "👻",
        "👽",
        "👾",
        "🤖",
        "😺",
        "😸",
        "😹",
        "😻",
        "😼",
        "😽",
        "🙀",
        "😿",
        "😾",
      ],
    },
    gestures: {
      name: "People & Body",
      icon: "👋",
      emojis: [
        "👋",
        "🤚",
        "🖐️",
        "✋",
        "🖖",
        "👌",
        "🤌",
        "🤏",
        "✌️",
        "🤞",
        "🤟",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "🖕",
        "👇",
        "☝️",
        "👍",
        "👎",
        "✊",
        "👊",
        "🤛",
        "🤜",
        "👏",
        "🙌",
        "👐",
        "🤲",
        "🤝",
        "🙏",
        "✍️",
        "💅",
        "🤳",
        "💪",
        "🦾",
        "🦿",
        "🦵",
        "🦶",
        "👂",
        "🦻",
        "👃",
        "🧠",
        "🫀",
        "🫁",
        "🦷",
        "🦴",
        "👀",
        "👁️",
        "👅",
        "👄",
        "👶",
        "🧒",
        "👦",
        "👧",
        "🧑",
        "👱",
        "👨",
        "🧔",
        "👩",
        "🧓",
        "👴",
        "👵",
        "🙍",
        "🙎",
        "🙅",
        "🙆",
        "💁",
        "🙋",
        "🧏",
        "🙇",
        "🤦",
        "🤷",
        "👮",
        "🕵️",
        "💂",
        "🥷",
        "👷",
        "🤴",
        "👸",
        "👳",
        "👲",
        "🧕",
        "🤵",
        "👰",
        "🤰",
        "🤱",
        "👼",
        "🎅",
        "🤶",
      ],
    },
    animals: {
      name: "Animals & Nature",
      icon: "🐱",
      emojis: [
        "🐶",
        "🐱",
        "🐭",
        "🐹",
        "🐰",
        "🦊",
        "🐻",
        "🐼",
        "🐻‍❄️",
        "🐨",
        "🐯",
        "🦁",
        "🐮",
        "🐷",
        "🐽",
        "🐸",
        "🐵",
        "🙈",
        "🙉",
        "🙊",
        "🐒",
        "🐔",
        "🐧",
        "🐦",
        "🐤",
        "🐣",
        "🐥",
        "🦆",
        "🦅",
        "🦉",
        "🦇",
        "🐺",
        "🐗",
        "🐴",
        "🦄",
        "🐝",
        "🪱",
        "🐛",
        "🦋",
        "🐌",
        "🐞",
        "🐜",
        "🦟",
        "🦗",
        "🪳",
        "🕷️",
        "🕸️",
        "🦂",
        "🐢",
        "🐍",
        "🦎",
        "🦖",
        "🦕",
        "🐙",
        "🦑",
        "🦐",
        "🦞",
        "🦀",
        "🐡",
        "🐠",
        "🐟",
        "🐬",
        "🐳",
        "🐋",
        "🦈",
        "🐊",
        "🐅",
        "🐆",
        "🦓",
        "🦍",
        "🦧",
        "🦣",
        "🐘",
        "🦛",
        "🦏",
        "🐪",
        "🐫",
        "🦒",
        "🦘",
        "🦬",
        "🐃",
        "🐂",
        "🐄",
        "🐎",
        "🐖",
        "🐏",
        "🐑",
        "🦙",
        "🐐",
        "🦌",
        "🐕",
        "🐩",
        "🦮",
        "🐕‍🦺",
        "🐈",
        "🐈‍⬛",
        "🪶",
        "🐓",
        "🦃",
        "🦤",
        "🦚",
        "🦜",
        "🦢",
        "🦩",
        "🕊️",
        "🐇",
        "🦝",
        "🦨",
        "🦡",
        "🦫",
        "🦦",
        "🦥",
        "🐁",
        "🐀",
        "🐿️",
        "🦔",
        "🐾",
        "🐉",
        "🐲",
        "🌵",
        "🎄",
        "🌲",
        "🌳",
        "🌴",
        "🪵",
        "🌱",
        "🌿",
        "☘️",
        "🍀",
        "🎍",
        "🪴",
        "🎋",
        "🍃",
        "🍂",
        "🍁",
        "🍄",
        "🌾",
        "💐",
        "🌷",
        "🌹",
        "🥀",
        "🌺",
        "🌸",
        "🌼",
        "🌻",
        "🌞",
        "🌝",
        "🌛",
        "🌜",
        "🌚",
      ],
    },
    food: {
      name: "Food & Drink",
      icon: "🍕",
      emojis: [
        "🍇",
        "🍈",
        "🍉",
        "🍊",
        "🍋",
        "🍌",
        "🍍",
        "🥭",
        "🍎",
        "🍏",
        "🍐",
        "🍑",
        "🍒",
        "🍓",
        "🫐",
        "🥝",
        "🍅",
        "🫒",
        "🥥",
        "🥑",
        "🍆",
        "🥔",
        "🥕",
        "🌽",
        "🌶️",
        "🫑",
        "🥒",
        "🥬",
        "🥦",
        "🧄",
        "🧅",
        "🍄",
        "🥜",
        "🌰",
        "🍞",
        "🥐",
        "🥖",
        "🫓",
        "🥨",
        "🥯",
        "🥞",
        "🧇",
        "🧀",
        "🍖",
        "🍗",
        "🥩",
        "🥓",
        "🍔",
        "🍟",
        "🍕",
        "🌭",
        "🥪",
        "🌮",
        "🌯",
        "🫔",
        "🥙",
        "🧆",
        "🥚",
        "🍳",
        "🥘",
        "🍲",
        "🫕",
        "🥣",
        "🥗",
        "🍿",
        "🧈",
        "🧂",
        "🥫",
        "🍱",
        "🍘",
        "🍙",
        "🍚",
        "🍛",
        "🍜",
        "🍝",
        "🍠",
        "🍢",
        "🍣",
        "🍤",
        "🍥",
        "🥮",
        "🍡",
        "🥟",
        "🥠",
        "🥡",
        "🦀",
        "🦞",
        "🦐",
        "🦑",
        "🦪",
        "🍦",
        "🍧",
        "🍨",
        "🍩",
        "🍪",
        "🎂",
        "🍰",
        "🧁",
        "🥧",
        "🍫",
        "🍬",
        "🍭",
        "🍮",
        "🍯",
        "🍼",
        "🥛",
        "☕",
        "🫖",
        "🍵",
        "🍶",
        "🍾",
        "🍷",
        "🍸",
        "🍹",
        "🍺",
        "🍻",
        "🥂",
        "🥃",
        "🥤",
        "🧋",
        "🧃",
        "🧉",
        "🧊",
        "🥢",
        "🍽️",
        "🍴",
        "🥄",
        "🔪",
        "🏺",
      ],
    },
    activities: {
      name: "Activities",
      icon: "⚽",
      emojis: [
        "⚽",
        "🏀",
        "🏈",
        "⚾",
        "🥎",
        "🎾",
        "🏐",
        "🏉",
        "🥏",
        "🎱",
        "🪀",
        "🏓",
        "🏸",
        "🏒",
        "🏑",
        "🥍",
        "🏏",
        "🪃",
        "🥅",
        "⛳",
        "🪁",
        "🏹",
        "🎣",
        "🤿",
        "🥊",
        "🥋",
        "🎽",
        "🛹",
        "🛼",
        "🛷",
        "⛸️",
        "🥌",
        "🎿",
        "⛷️",
        "🏂",
        "🪂",
        "🏋️",
        "🤼",
        "🤸",
        "⛹️",
        "🤺",
        "🤾",
        "🏌️",
        "🏇",
        "⛑️",
        "🧘",
        "🏄",
        "🏊",
        "🤽",
        "🚣",
        "🧗",
        "🚵",
        "🚴",
        "🏆",
        "🥇",
        "🥈",
        "🥉",
        "🏅",
        "🎖️",
        "🏵️",
        "🎗️",
        "🎫",
        "🎟️",
        "🎪",
        "🤹",
        "🎭",
        "🩰",
        "🎨",
        "🎬",
        "🎤",
        "🎧",
        "🎼",
        "🎹",
        "🥁",
        "🪘",
        "🎷",
        "🎺",
        "🪗",
        "🎸",
        "🪕",
        "🎻",
        "🎲",
        "♟️",
        "🎯",
        "🎳",
        "🎮",
        "🎰",
        "🧩",
      ],
    },
    travel: {
      name: "Travel & Places",
      icon: "🚗",
      emojis: [
        "🚗",
        "🚕",
        "🚙",
        "🚌",
        "🚎",
        "🏎️",
        "🚓",
        "🚑",
        "🚒",
        "🚐",
        "🛻",
        "🚚",
        "🚛",
        "🚜",
        "🦯",
        "🦽",
        "🦼",
        "🛴",
        "🚲",
        "🛵",
        "🏍️",
        "🛺",
        "🚨",
        "🚔",
        "🚍",
        "🚘",
        "🚖",
        "🚡",
        "🚠",
        "🚟",
        "🚃",
        "🚋",
        "🚞",
        "🚝",
        "🚄",
        "🚅",
        "🚈",
        "🚂",
        "🚆",
        "🚇",
        "🚊",
        "🚉",
        "✈️",
        "🛫",
        "🛬",
        "🛩️",
        "💺",
        "🛰️",
        "🚀",
        "🛸",
        "🚁",
        "🛶",
        "⛵",
        "🚤",
        "🛥️",
        "🛳️",
        "⛴️",
        "🚢",
        "⚓",
        "🪝",
        "⛽",
        "🚧",
        "🚦",
        "🚥",
        "🚏",
        "🗺️",
        "🗿",
        "🗽",
        "🗼",
        "🏰",
        "🏯",
        "🏟️",
        "🎡",
        "🎢",
        "🎠",
        "⛲",
        "⛱️",
        "🏖️",
        "🏝️",
        "🏜️",
        "🌋",
        "⛰️",
        "🏔️",
        "🗻",
        "🏕️",
        "⛺",
        "🛖",
        "🏠",
        "🏡",
        "🏘️",
        "🏚️",
        "🏗️",
        "🏭",
        "🏢",
        "🏬",
        "🏣",
        "🏤",
        "🏥",
        "🏦",
        "🏨",
        "🏪",
        "🏫",
        "🏩",
        "💒",
        "🏛️",
        "⛪",
        "🕌",
        "🕍",
        "🛕",
        "🕋",
      ],
    },
    objects: {
      name: "Objects",
      icon: "💡",
      emojis: [
        "⌚",
        "📱",
        "📲",
        "💻",
        "⌨️",
        "🖥️",
        "🖨️",
        "🖱️",
        "🖲️",
        "💽",
        "💾",
        "💿",
        "📀",
        "📼",
        "📷",
        "📸",
        "📹",
        "🎥",
        "📽️",
        "🎞️",
        "📞",
        "☎️",
        "📟",
        "📠",
        "📺",
        "📻",
        "🎙️",
        "🎚️",
        "🎛️",
        "🧭",
        "⏱️",
        "⏲️",
        "⏰",
        "🕰️",
        "⌛",
        "⏳",
        "📡",
        "🔋",
        "🔌",
        "💡",
        "🔦",
        "🕯️",
        "🪔",
        "🧯",
        "🛢️",
        "💸",
        "💵",
        "💴",
        "💶",
        "💷",
        "🪙",
        "💰",
        "💳",
        "💎",
        "⚖️",
        "🪜",
        "🧰",
        "🪛",
        "🔧",
        "🔨",
        "⚒️",
        "🛠️",
        "⛏️",
        "🪚",
        "🔩",
        "⚙️",
        "🪤",
        "🧱",
        "⛓️",
        "🧲",
        "🔫",
        "💣",
        "🧨",
        "🪓",
        "🔪",
        "🗡️",
        "⚔️",
        "🛡️",
        "🚬",
        "⚰️",
        "🪦",
        "⚱️",
        "🏺",
        "🔮",
        "📿",
        "🧿",
        "💈",
        "⚗️",
        "🔭",
        "🔬",
        "🕳️",
        "🩹",
        "🩺",
        "💊",
        "💉",
        "🩸",
        "🧬",
        "🦠",
        "🧫",
        "🧪",
      ],
    },
    symbols: {
      name: "Symbols",
      icon: "❤️",
      emojis: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "☮️",
        "✝️",
        "☪️",
        "🕉️",
        "☸️",
        "✡️",
        "🔯",
        "🕎",
        "☯️",
        "☦️",
        "🛐",
        "⛎",
        "♈",
        "♉",
        "♊",
        "♋",
        "♌",
        "♍",
        "♎",
        "♏",
        "♐",
        "♑",
        "♒",
        "♓",
        "🆔",
        "⚛️",
        "🉑",
        "☢️",
        "☣️",
        "📴",
        "📳",
        "🈶",
        "🈚",
        "🈸",
        "🈺",
        "🈷️",
        "✴️",
        "🆚",
        "💮",
        "🉐",
        "㊙️",
        "㊗️",
        "🈴",
        "🈵",
        "🈹",
        "🈲",
        "🅰️",
        "🅱️",
        "🆎",
        "🆑",
        "🅾️",
        "🆘",
        "❌",
        "⭕",
        "🛑",
        "⛔",
        "📛",
        "🚫",
        "💯",
        "💢",
        "♨️",
        "🚷",
        "🚯",
        "🚳",
        "🚱",
        "🔞",
        "📵",
        "🚭",
        "❗",
        "❕",
        "❓",
        "❔",
        "‼️",
        "⁉️",
        "🔅",
        "🔆",
        "〽️",
        "⚠️",
        "🚸",
        "🔱",
        "⚜️",
        "🔰",
        "♻️",
        "✅",
        "🈯",
        "💹",
        "❇️",
        "✳️",
        "❎",
        "🌐",
        "💠",
        "Ⓜ️",
        "🌀",
        "💤",
        "🏧",
        "🚾",
        "♿",
        "🅿️",
        "🛗",
        "🈳",
        "🈂️",
        "🛂",
        "🛃",
        "🛄",
        "🛅",
        "🚹",
        "🚺",
        "🚼",
        "⚧️",
        "🚻",
        "🚮",
        "🎦",
        "📶",
        "🈁",
        "🔣",
        "ℹ️",
        "🔤",
        "🔡",
        "🔠",
        "🆖",
        "🆗",
        "🆙",
        "🆒",
        "🆕",
        "🆓",
        "0️⃣",
        "1️⃣",
        "2️⃣",
        "3️⃣",
        "4️⃣",
        "5️⃣",
        "6️⃣",
        "7️⃣",
        "8️⃣",
        "9️⃣",
        "🔟",
        "🔢",
        "#️⃣",
        "*️⃣",
        "⏏️",
        "▶️",
        "⏸️",
        "⏯️",
        "⏹️",
        "⏺️",
        "⏭️",
        "⏮️",
        "⏩",
        "⏪",
        "⏫",
        "⏬",
        "◀️",
        "🔼",
        "🔽",
        "➡️",
        "⬅️",
        "⬆️",
        "⬇️",
        "↗️",
        "↘️",
        "↙️",
        "↖️",
        "↕️",
        "↔️",
        "↩️",
        "↪️",
        "⤴️",
        "⤵️",
        "🔀",
        "🔁",
        "🔂",
      ],
    },
    flags: {
      name: "Flags",
      icon: "🏳️",
      emojis: [
        "🏳️",
        "🏴",
        "🏴‍☠️",
        "🏁",
        "🚩",
        "🎌",
        "🏳️‍🌈",
        "🏳️‍⚧️",
        "🇦🇫",
        "🇦🇱",
        "🇩🇿",
        "🇦🇸",
        "🇦🇩",
        "🇦🇴",
        "🇦🇮",
        "🇦🇶",
        "🇦🇬",
        "🇦🇷",
        "🇦🇲",
        "🇦🇼",
        "🇦🇺",
        "🇦🇹",
        "🇦🇿",
        "🇧🇸",
        "🇧🇭",
        "🇧🇩",
        "🇧🇧",
        "🇧🇾",
        "🇧🇪",
        "🇧🇿",
        "🇧🇯",
        "🇧🇲",
        "🇧🇹",
        "🇧🇴",
        "🇧🇦",
        "🇧🇼",
        "🇧🇷",
        "🇮🇴",
        "🇻🇬",
        "🇧🇳",
        "🇧🇬",
        "🇧🇫",
        "🇧🇮",
        "🇰🇭",
        "🇨🇲",
        "🇨🇦",
        "🇮🇨",
        "🇨🇻",
        "🇧🇶",
        "🇰🇾",
        "🇨🇫",
        "🇹🇩",
        "🇨🇱",
        "🇨🇳",
        "🇨🇽",
        "🇨🇨",
        "🇨🇴",
        "🇰🇲",
        "🇨🇬",
        "🇨🇩",
        "🇨🇰",
        "🇨🇷",
        "🇨🇮",
        "🇭🇷",
        "🇨🇺",
        "🇨🇼",
        "🇨🇾",
        "🇨🇿",
        "🇩🇰",
        "🇩🇯",
        "🇩🇲",
        "🇩🇴",
        "🇪🇨",
        "🇪🇬",
        "🇸🇻",
        "🇬🇶",
        "🇪🇷",
        "🇪🇪",
        "🇸🇿",
        "🇪🇹",
      ],
    },
  };

  // ============================================================
  // EMOJI PICKER CLASS
  // ============================================================

  class BaelEmojiPicker {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this.recentEmojis = this._loadRecent();
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-emoji-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-emoji-styles";
      styles.textContent = `
                .bael-emoji-picker {
                    position: absolute;
                    width: 340px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    font-family: system-ui, -apple-system, sans-serif;
                    z-index: 10000;
                    overflow: hidden;
                }

                .bael-emoji-header {
                    padding: 12px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .bael-emoji-search {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.15s;
                }

                .bael-emoji-search:focus {
                    border-color: #4f46e5;
                }

                .bael-emoji-categories {
                    display: flex;
                    padding: 8px;
                    border-bottom: 1px solid #e5e7eb;
                    gap: 4px;
                }

                .bael-emoji-cat-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border: none;
                    background: transparent;
                    font-size: 18px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: background 0.15s;
                }

                .bael-emoji-cat-btn:hover {
                    background: #f3f4f6;
                }

                .bael-emoji-cat-btn.active {
                    background: #eef2ff;
                }

                .bael-emoji-content {
                    height: 280px;
                    overflow-y: auto;
                    padding: 8px;
                }

                .bael-emoji-section {
                    margin-bottom: 16px;
                }

                .bael-emoji-section-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    padding: 4px 8px;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .bael-emoji-grid {
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    gap: 4px;
                }

                .bael-emoji-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    border: none;
                    background: transparent;
                    font-size: 22px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: background 0.15s, transform 0.1s;
                }

                .bael-emoji-btn:hover {
                    background: #f3f4f6;
                    transform: scale(1.2);
                }

                .bael-emoji-empty {
                    text-align: center;
                    padding: 40px;
                    color: #9ca3af;
                }

                .bael-emoji-empty-icon {
                    font-size: 40px;
                    margin-bottom: 8px;
                }

                /* Skin tone selector */
                .bael-emoji-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 8px 12px;
                    border-top: 1px solid #e5e7eb;
                    gap: 4px;
                }

                .bael-emoji-skin {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: transform 0.15s;
                }

                .bael-emoji-skin:hover {
                    transform: scale(1.2);
                }

                .bael-emoji-skin.active {
                    border-color: #4f46e5;
                }

                .bael-emoji-skin.tone-0 { background: #ffcc22; }
                .bael-emoji-skin.tone-1 { background: #f7d7c4; }
                .bael-emoji-skin.tone-2 { background: #d8b094; }
                .bael-emoji-skin.tone-3 { background: #bb9167; }
                .bael-emoji-skin.tone-4 { background: #8e562e; }
                .bael-emoji-skin.tone-5 { background: #613d30; }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE PICKER
    // ============================================================

    /**
     * Create emoji picker
     */
    create(options = {}) {
      const id = `bael-emoji-${++this.idCounter}`;
      const config = {
        target: null, // trigger element
        position: "bottom-start",
        showSearch: true,
        showCategories: true,
        showSkinTones: true,
        showRecent: true,
        recentCount: 20,
        onSelect: null,
        onClose: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-emoji-picker";
      el.id = id;
      el.style.display = "none";

      const state = {
        id,
        element: el,
        config,
        activeCategory:
          config.showRecent && this.recentEmojis.length ? "recent" : "smileys",
        searchQuery: "",
        skinTone: 0,
      };

      this._render(state);
      document.body.appendChild(el);

      // Setup trigger
      if (config.target) {
        this._setupTrigger(state, config.target);
      }

      // Click outside to close
      document.addEventListener("click", (e) => {
        if (
          !el.contains(e.target) &&
          (!config.target || !config.target.contains(e.target))
        ) {
          this.hide(id);
        }
      });

      this.instances.set(id, state);

      return {
        id,
        show: () => this.show(id),
        hide: () => this.hide(id),
        toggle: () => this.toggle(id),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Setup trigger element
     */
    _setupTrigger(state, target) {
      if (typeof target === "string") {
        target = document.querySelector(target);
      }

      if (target) {
        state.config.target = target;
        target.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggle(state.id);
        });
      }
    }

    /**
     * Render picker
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Header with search
      if (config.showSearch) {
        const header = document.createElement("div");
        header.className = "bael-emoji-header";

        const search = document.createElement("input");
        search.type = "text";
        search.className = "bael-emoji-search";
        search.placeholder = "Search emojis...";
        search.addEventListener("input", () => {
          state.searchQuery = search.value;
          this._renderContent(state);
        });

        header.appendChild(search);
        element.appendChild(header);
      }

      // Category tabs
      if (config.showCategories) {
        const categories = document.createElement("div");
        categories.className = "bael-emoji-categories";

        Object.entries(EMOJI_CATEGORIES).forEach(([key, category]) => {
          if (
            key === "recent" &&
            (!config.showRecent || !this.recentEmojis.length)
          )
            return;

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `bael-emoji-cat-btn${key === state.activeCategory ? " active" : ""}`;
          btn.textContent = category.icon;
          btn.title = category.name;
          btn.addEventListener("click", () => {
            state.activeCategory = key;
            state.searchQuery = "";
            const searchInput = element.querySelector(".bael-emoji-search");
            if (searchInput) searchInput.value = "";
            this._render(state);
          });

          categories.appendChild(btn);
        });

        element.appendChild(categories);
      }

      // Content
      const content = document.createElement("div");
      content.className = "bael-emoji-content";
      state.contentEl = content;
      element.appendChild(content);

      this._renderContent(state);

      // Footer with skin tones
      if (config.showSkinTones) {
        const footer = document.createElement("div");
        footer.className = "bael-emoji-footer";

        for (let i = 0; i <= 5; i++) {
          const skin = document.createElement("button");
          skin.type = "button";
          skin.className = `bael-emoji-skin tone-${i}${state.skinTone === i ? " active" : ""}`;
          skin.addEventListener("click", () => {
            state.skinTone = i;
            this._render(state);
          });
          footer.appendChild(skin);
        }

        element.appendChild(footer);
      }
    }

    /**
     * Render emoji content
     */
    _renderContent(state) {
      const { contentEl, searchQuery, activeCategory, config } = state;

      contentEl.innerHTML = "";

      if (searchQuery) {
        // Search results
        const results = this._searchEmojis(searchQuery);

        if (results.length) {
          const section = this._createEmojiSection(
            state,
            "Search Results",
            results,
          );
          contentEl.appendChild(section);
        } else {
          contentEl.innerHTML = `
                        <div class="bael-emoji-empty">
                            <div class="bael-emoji-empty-icon">🔍</div>
                            <div>No emojis found</div>
                        </div>
                    `;
        }
      } else {
        // Show category
        const category = EMOJI_CATEGORIES[activeCategory];

        if (activeCategory === "recent") {
          if (this.recentEmojis.length) {
            const section = this._createEmojiSection(
              state,
              "Recently Used",
              this.recentEmojis,
            );
            contentEl.appendChild(section);
          }
        } else if (category) {
          const section = this._createEmojiSection(
            state,
            category.name,
            category.emojis,
          );
          contentEl.appendChild(section);
        }
      }
    }

    /**
     * Create emoji section
     */
    _createEmojiSection(state, title, emojis) {
      const section = document.createElement("div");
      section.className = "bael-emoji-section";

      const sectionTitle = document.createElement("div");
      sectionTitle.className = "bael-emoji-section-title";
      sectionTitle.textContent = title;
      section.appendChild(sectionTitle);

      const grid = document.createElement("div");
      grid.className = "bael-emoji-grid";

      emojis.forEach((emoji) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bael-emoji-btn";
        btn.textContent = emoji;
        btn.addEventListener("click", () => this._selectEmoji(state, emoji));
        grid.appendChild(btn);
      });

      section.appendChild(grid);
      return section;
    }

    /**
     * Search emojis
     */
    _searchEmojis(query) {
      const lowerQuery = query.toLowerCase();
      const results = [];

      Object.entries(EMOJI_CATEGORIES).forEach(([key, category]) => {
        if (key === "recent") return;

        category.emojis.forEach((emoji) => {
          // Simple match - in real app would use emoji names/keywords
          if (category.name.toLowerCase().includes(lowerQuery)) {
            results.push(emoji);
          }
        });
      });

      // Limit results
      return results.slice(0, 50);
    }

    /**
     * Select emoji
     */
    _selectEmoji(state, emoji) {
      // Add to recent
      this._addToRecent(emoji);

      // Callback
      if (state.config.onSelect) {
        state.config.onSelect(emoji);
      }

      // Hide picker
      this.hide(state.id);
    }

    /**
     * Add to recent emojis
     */
    _addToRecent(emoji) {
      const index = this.recentEmojis.indexOf(emoji);
      if (index > -1) {
        this.recentEmojis.splice(index, 1);
      }
      this.recentEmojis.unshift(emoji);
      this.recentEmojis = this.recentEmojis.slice(0, 20);
      EMOJI_CATEGORIES.recent.emojis = this.recentEmojis;
      this._saveRecent();
    }

    /**
     * Load recent from localStorage
     */
    _loadRecent() {
      try {
        const stored = localStorage.getItem("bael-emoji-recent");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    /**
     * Save recent to localStorage
     */
    _saveRecent() {
      try {
        localStorage.setItem(
          "bael-emoji-recent",
          JSON.stringify(this.recentEmojis),
        );
      } catch {
        // Ignore
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Show picker
     */
    show(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      state.element.style.display = "block";

      // Position relative to target
      if (state.config.target) {
        this._positionPicker(state);
      }
    }

    /**
     * Position picker
     */
    _positionPicker(state) {
      const { element, config } = state;
      const targetRect = config.target.getBoundingClientRect();
      const pickerRect = element.getBoundingClientRect();

      let top = targetRect.bottom + 8;
      let left = targetRect.left;

      // Adjust for screen edges
      if (top + pickerRect.height > window.innerHeight) {
        top = targetRect.top - pickerRect.height - 8;
      }

      if (left + pickerRect.width > window.innerWidth) {
        left = window.innerWidth - pickerRect.width - 8;
      }

      element.style.top = `${top}px`;
      element.style.left = `${Math.max(8, left)}px`;
    }

    /**
     * Hide picker
     */
    hide(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      state.element.style.display = "none";

      if (state.config.onClose) {
        state.config.onClose();
      }
    }

    /**
     * Toggle picker
     */
    toggle(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      if (state.element.style.display === "none") {
        this.show(pickerId);
      } else {
        this.hide(pickerId);
      }
    }

    /**
     * Destroy picker
     */
    destroy(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(pickerId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelEmojiPicker();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$emojiPicker = (options) => bael.create(options);
  window.$emoji = window.$emojiPicker;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelEmojiPicker = bael;

  console.log("😀 BAEL Emoji Picker Component loaded");
})();
