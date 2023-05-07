import { editor, IPosition, IRange, Range } from "monaco-editor/esm/vs/editor/editor.api"
import { isRecord } from "utils"

type ObjectType = "array" | "record" | "primitive"

interface ValueKey {
  value: unknown
  keys: string[]
}

export interface RangedEntry {
  value: unknown
  keys: string[]
  range: IRange
}

// interface ValueRange {
//   value: unknown
//   range: IRange
// }

class RangedEntries {
  readonly ranges: IRange[] = []
  readonly rangedEntries: Map<IRange, ValueKey> = new Map

  // readonly flattenObjectWithRange: Map<string, ValueRange> = new Map

  constructor(
    private object: Record<keyof never, unknown> | unknown[],
    model: editor.IModel
  ) {
    let searchStart: IPosition = { column: 0, lineNumber: 0 }

    this.traverse((keys, value, type) => {
      function getSearchString() {
        const lastKey = keys.at(-1)
        const fieldSearch = lastKey?.startsWith("[") ? "" : `"${lastKey}":`

        switch (type) {
          case "array":
            return fieldSearch + `\\s*?\\[`
          case "record":
            return fieldSearch + `\\s*?\\{`

          default:
            return fieldSearch
        }
      }

      const match = model.findNextMatch(getSearchString(), searchStart, true, false, null, false)
      if (match == null) return

      searchStart = match.range.getEndPosition()
      const range = match.range

      this.ranges.push(range)
      this.rangedEntries.set(range, { value, keys })

      // this.keys.push(flattenKeys)
      // this.flattenObject[flattenKeys] = value
      // this.flattenObjectWithRange.set(flattenKeys, { value, range })
    })
  }

  private traverse(callback: (keys: string[], value: unknown, type: ObjectType) => void): void {
    function iterate(object: Record<keyof never, unknown> | unknown[], initialKeys: string[] = [], type: ObjectType = "record") {
      for (const [key, value] of Object.entries(object)) {
        const keys: string[] = [...initialKeys]
        if (type === "record") keys.push(key)
        if (type === "array") keys.push(`[${key}]`)

        if (isRecord(value)) {
          callback(keys, value, "record")
          iterate(value, keys, "record")

          continue
        }

        if (value instanceof Array) {
          callback(keys, value, "array")
          iterate(value, keys, "array")

          continue
        }

        callback(keys, value, "primitive")
      }
    }

    iterate(this.object)
  }

  // public containsKey(key: string): boolean {
  //   return this.keys.includes(key)
  // }

  public containsRange(range: IRange): boolean {
    return this.ranges.includes(range)
  }

  // public containsPosition() {}

  // public getByKey(key: string): ValueRange {
  //   const item = this.flattenObjectWithRange.get(key)
  //   if (item == null) {
  //     throw new Error("Couldn't get by key.")
  //   }

  //   return item
  // }

  public getByRange(range: IRange): ValueKey {
    const item = this.rangedEntries.get(range)
    if (item == null) {
      throw new Error("Couldn't get by range.")
    }

    return item
  }

  public findByRange(otherRange: IRange): ValueKey {
    const range = this.ranges.find(range => Range.containsRange(range, otherRange))
    if (range == null) {
      throw new Error("Couldn't find an entry in the range.")
    }

    return this.getByRange(range)
  }

  public findByValue(value: string): RangedEntry[] {
    const rangedEntries: RangedEntry[] = []

    for (const [range, entry] of this.rangedEntries.entries()) {
      if (JSON.stringify(entry.value).includes(value)) {
        rangedEntries.push({ ...entry, range })
      }
    }

    return rangedEntries
  }
}

export default RangedEntries

// function flattenObject(a: Record<keyof never, unknown> | unknown[]): Record<string, unknown> {
//   const record: Record<keyof never, unknown> = {}

//   function iterate(object: Record<keyof never, unknown> | unknown[], initialKeys: string[] = []) {
//     for (const [key, value] of Object.entries(object)) {
//       const keys: string[] = [...initialKeys, key]

//       if (isRecord(value) && value instanceof Array) {
//         iterate(value, keys)
//         continue
//       }

//       record[keys.join(".")] = value
//     }
//   }

//   iterate(a)

//   return record
// }

// flattenObject({
//   "translation": {
//     "test": "Test string.",
//     "penis": "govno",
//     "lines": [
//       "test - 1",
//       "test - 2",
//       "test - 3"
//     ],
//     "fingers": [
//       {
//         "title": "index",
//         "index": 1
//       },
//       {
//         "title": "penis",
//         "index": 2
//       }
//     ]
//   },
//   "test": {
//     "lang": "English",
//     "langCode": "en",
//     "currency": {
//       "name": "usd",
//       "symbol": "$",
//       "convertion": 0.0136986301369863
//     },
//     "head": {
//       "title": "StandoffCase.net - Open the best Standoff 2 cases",
//       "description": "STANDOFFCASE - the most profitable site for opening cases Standoff 2! More than 30 cases are waiting for you! Instant withdrawal to Standoff! Open with us :)",
//       "keywords": "opening cases standoff 2, opening cases standoff 2, opening cases, standoff 2, standoff, standoff 2, standoff, standoff 2, standoff, cases standoff 2, cases standoff, opening cases standoff, opening standoff cases, standoff case, standoffcase, standoff cases, standoff cases, standoff skins standoff 2, standoff 2 skins, knife standoff 2, knife standoff 2, karambit gold, karambit gold, gold standoff, gold standoff",
//       "og:title": "Come in and open Standoff 2 cases with me!",
//       "og:description": "STANDOFFCASE - the most profitable site for opening cases Standoff 2! More than 30 cases are waiting for you! Instant withdrawal to Standoff! Open with us :)"
//     },
//     "general": {
//       "empty": "Empty",
//       "socProfile": "Social profile the network",
//       "emptyBlock": {
//         "title": "Oops, there is nothing :\\",
//         "desc": "As you can see, there are no items.",
//         "defaultButton": "To the main",
//         "toContracts": "Into contracts",
//         "toBattles": "Into battles",
//         "toUpgrades": "In upgrades",
//         "toBonuses": "Into the drum of bonuses"
//       },
//       "searchPlaceholder": "Name of the box",
//       "rarity": {
//         "any": "Any quality",
//         "common": "Common",
//         "uncommon": "UnCommon",
//         "rare": "Rare",
//         "epic": "Epic",
//         "legendary": "Legendary",
//         "arcane": "Arcane"
//       },
//       "ticket": {
//         "message": "Your Message",
//         "submit": "Send"
//       },
//       "formation": {
//         "from": "from",
//         "among": "from",
//         "to": "To"
//       },
//       "case": {
//         "sell": "Sell item",
//         "withdraw": "Get a skin",
//         "cancelWithdraw": "Cancel output",
//         "searchPlaceholder": "Case Name",
//         "searchClear": "Reset",
//         "type": {
//           "1": "Dropped out of the pay box",
//           "2": "Dropped out of contract",
//           "3": "Drop out of upgrade",
//           "4": "Dropped out of battles",
//           "5": "Dropped out of the bonus reel",
//           "6": "Dropped out of the free box",
//           "7": "Dropped from a bonus"
//         },
//         "status": {
//           "1": "Active item",
//           "2": "Withdrawn item",
//           "3": "Item went into contract",
//           "4": "Item went into upgrade",
//           "5": "Activated bonus",
//           "6": "Pending withdrawal",
//           "7": "Withdrawn item",
//           "8": "Active for contract"
//         }
//       }
//     },
//     "header": {
//       "topbar": {
//         "navigation": {
//           "home": "Cases",
//           "contract": "Contracts",
//           "upgrade": "Upgrades",
//           "bonuses": "Bonuses",
//           "top": "Top",
//           "battles": "Battles",
//           "battle_pass": "Season Pass",
//           "support": "Support"
//         },
//         "demo": {
//           "title": "Demo Mode",
//           "desc": "Try opening the crates for free!"
//         },
//         "bonusLetter": "B",
//         "buttons": {
//           "topUp": "Top up your balance",
//           "getDemo": "Get Demo"
//         }
//       },
//       "liveFeed": {
//         "title": "Live feed",
//         "best": "Top",
//         "all": "All"
//       }
//     },
//     "footer": {
//       "desc": "On our site you can open various cases on the game Standoff 2 and the best prices!",
//       "links": {
//         "termsContracts": "User agreement and contacts"
//       }
//     },
//     "views": {
//       "battle": {
//         "article": {
//           "pageTitle": "Battlecry",
//           "inventoryTitle": "You can get"
//         },
//         "bottom": {
//           "text": "You open a case",
//           "grantedPrize": "Guaranteed prize of $price1 to $price2",
//           "buttons": {
//             "cancel": "Cancel",
//             "sellAll": "Sell it all",
//             "again": "Try Again"
//           }
//         }
//       },
//       "battles": {
//         "article": {
//           "title": "Battles",
//           "desc": "Compete with players in open duels! \n Whoever gets the more expensive item will take your opponent's item! \n If you lose, you get a guaranteed prize!"
//         },
//         "stats": {
//           "active": "Active",
//           "total": "Battles in total"
//         },
//         "table": {
//           "menu": [
//             "Case",
//             "Active rooms",
//             "Cost",
//             "Action"
//           ],
//           "buttons": {
//             "join": "Sign in",
//             "create": "Create",
//             "back": "Return",
//             "free": " free"
//           }
//         }
//       },
//       "bonuses": {
//         "article": {
//           "title": "Bonuses from StandoffCase",
//           "desc": "Complete tasks and get nice <em>bonuses on the site!</em> \n Bonuses can be obtained every day, so don't forget to log in!"
//         },
//         "daily": {
//           "title": "Daily Bonus",
//           "desc": "Daily bonus from 1₽ to 45₽ every 24 hours. Increase your level and increase your bonus."
//         },
//         "single": {
//           "title": "One-Time Bonus",
//           "desc": "A one-time bonus of 2₽ to 10₽ for completing each task. You can only get them once at a time."
//         },
//         "3k": {
//           "title": "Weekly Bonus",
//           "desc": "A weekly bonus of 30₽ to the balance of the site to a random 100 participants! Promote the site for balance!"
//         },
//         "button": "Get bonus"
//       },
//       "top": {
//         "article": {
//           "title": "Top Users",
//           "desc": "List of the site's top players who were the luckiest!"
//         },
//         "tops": {
//           "common": "General Top",
//           "daily": "Top of the Day"
//         },
//         "stats": {
//           "cases": "Cases",
//           "contracts": "Contracts",
//           "battles": "Battles",
//           "upgrades": "Upgrades"
//         },
//         "daily": {
//           "title": "Top Prize of the Day",
//           "desc": [
//             "As well as",
//             "for 2nd and",
//             "for 3rd place"
//           ],
//           "articles": [
//             {
//               "title": "What is a Top of Day?",
//               "desc": "If you are one of the first 3 players in the Top of the Day, \n you're guaranteed to get cash prizes on the site! \n \n The balance of the top users of the day is given out \n every day at 23:59 Moscow time!"
//             },
//             {
//               "title": "How to get into the top of the day?",
//               "desc": "Open crates, create contracts, upgrades, and \n take part in battles!  More profit - higher top line!"
//             }
//           ],
//           "button": "Open cases"
//         },
//         "table": {
//           "menu": [
//             "Location",
//             "User",
//             "Cases",
//             "Contracts",
//             "Upgrades",
//             "Battles",
//             "Profit"
//           ],
//           "buttons": {
//             "join": "Sign in",
//             "create": "Create"
//           }
//         }
//       },
//       "home": {
//         "demo": {
//           "title": "Demo Mode",
//           "desc": "Try all the great features of our site for free."
//         },
//         "filters": {
//           "search": "Case Name",
//           "checkbox": "Opening bonuses only"
//         }
//       },
//       "case": {
//         "article": {
//           "title": "",
//           "desc": ""
//         },
//         "free": "free",
//         "benefitText1": "For opening this case",
//         "benefitText2": "For opening this case",
//         "multipleText": "How much to open?",
//         "buttons": {
//           "open": "Open [Enter].",
//           "openFast": "Open fast [F]."
//         },
//         "exceptions": {
//           "unauthed": {
//             "title": "Authenticate",
//             "desc": "Only authorized users can open cases \n authorized users!",
//             "button": "Sign in"
//           },
//           "insufficient": {
//             "title": "don't have enough",
//             "desc": "You do not have enough funds for \n items!",
//             "button": "Top up your balance"
//           },
//           "limit": {
//             "title": "Limit",
//             "desc": "Wait 60 seconds"
//           }
//         }
//       },
//       "contract": {
//         "article": {
//           "title": "Exchange Contract",
//           "desc": "Give up <em>3 or more</em> items - you get a random \n item based on the value of your contract!"
//         },
//         "sidebarTitle": "Inventory",
//         "sidebardesc": "Available for exchange: \n <em>$itemsCount of items</em>",
//         "clearSlots": "Clear Contract",
//         "create": {
//           "column1": {
//             "title": "Selected for exchange:",
//             "desc": "$itemsCount items, <em>$price</em>"
//           },
//           "column2": {
//             "title": "As a result, you get:",
//             "desc": "Item values from <em>$minPrice</em> to <em>$maxPrice</em>"
//           },
//           "button": {
//             "error": "Add items",
//             "default": "Next",
//             "create": "Create Contract"
//           }
//         },
//         "slotsTitle": "Selected for exchange:",
//         "slotsDesc": "items",
//         "buttons": {
//           "add": "Add",
//           "remove": "Delete"
//         },
//         "sign": {
//           "heading": "Contract",
//           "date": "Date",
//           "user": "User",
//           "level": "Level",
//           "chosenItems": "Contributed items",
//           "empty": "...Empty",
//           "yourSign": "Your Signature",
//           "form": "Form",
//           "droppedItem": "Maximum item",
//           "pending": "Pending Item...",
//           "termsDesc": "You need to read the contract and then sign it. Once you have signed the contract, click the \"Submit\" button."
//         }
//       },
//       "payment": {
//         "title": "Top up your balance",
//         "placeholder": "Enter a promo code",
//         "desc": "The balance is topped up instantly, but if this does not happen within one hour, write to \n us by e-mail yes@standoffcasesupport.ru with detailed information about payment.",
//         "menu": {
//           "method": "Payment system",
//           "bonus": "Bonus",
//           "promocode": "Promo code"
//         },
//         "pages": {
//           "method": {
//             "title": "Choice of method",
//             "desc": "You will be redirected to the payment system's site to replenish your balance.",
//             "text": "Balance is topped up instantly, but if this has not happened within an hour please send \n us by e-mail yes@standoffcasesupport.ru with detailed information about payment.",
//             "sum": "Amount",
//             "methods": {
//               "first": "First way",
//               "second": "The second way",
//               "QIWI": "QIWI"
//             }
//           },
//           "bonus": {
//             "title": "Choice of method",
//             "desc": "To deposit you will be redirected to the payment system site."
//           },
//           "promocode": {
//             "title": "Choosing the payment method",
//             "desc": "To replenish balance you will be redirected to the payment system website.",
//             "progressBarText": "Promo code bonus"
//           }
//         },
//         "buttons": {
//           "chooseMethod": "Choose payment method",
//           "noBonus": "without bonus",
//           "noPromocode": "without promo code",
//           "nextStep": "Continue to",
//           "submit": "Refill",
//           "usePromocode": "Use promo code"
//         }
//       },
//       "profile": {
//         "anotherMenu": [
//           "Items",
//           "Contracts",
//           "Battles",
//           "Upgrades",
//           "Bonuses"
//         ],
//         "rewards": {
//           "cases": "Total Boxes Opened",
//           "contracts": "Total contracts signed",
//           "battles": "Battles (wins / losses / draws)",
//           "upgrades": "Upgrades (wins/losses)",
//           "bestCase": "Favorite Box",
//           "bestDrop": "Best Drawer Item"
//         },
//         "branch": {
//           "title": "Your balance",
//           "topUp": "Top up your balance",
//           "menu": {
//             "items": "Items",
//             "contracts": "Contracts",
//             "battles": "Battles",
//             "upgrades": "Upgrades",
//             "bonuses": "Bonuses",
//             "topUpHistory": "Replenishment History",
//             "settings": "settings",
//             "referalSystem": "Referral system",
//             "exit": "Sign out"
//           },
//           "battles": {
//             "title": "Battles",
//             "desc": "You have participated in $battlesCount battles",
//             "getMore": "New battle"
//           },
//           "bonuses": {
//             "title": "Bonuses",
//             "desc": "You have $bonusesCount bonuses with you",
//             "getMore": "In $bonusesCount of bonuses"
//           },
//           "contracts": {
//             "title": "Contracts",
//             "desc": "$contractsCount of created contract",
//             "getMore": "New contract"
//           },
//           "deposits": {
//             "title": "Deposit history",
//             "desc": "History of operations with your balance",
//             "menu": "Number, Method, Date, Amount"
//           },
//           "drop": {
//             "title": "Battles",
//             "desc": "You have participated in $battlesCount battles",
//             "getMore": "New battle"
//           },
//           "inventory": {
//             "title": "Your items",
//             "desc": "Total $itemsCount of items",
//             "sellAllDrops": "Sell all items",
//             "filters": "filters",
//             "hide": "Hide",
//             "show": "Show",
//             "getMore": "New battle"
//           },
//           "level": {
//             "level": "Level",
//             "learnMore": "Learn more"
//           },
//           "referal": {
//             "title": "Referral system",
//             "desc": "Earn balance on the site by inviting friends through referral system!",
//             "getMore": "New battle",
//             "levelTitle": "Your level",
//             "levelDesc": "Share your code with your friends and get a percentage of your balance for each replenishment. You can change your Invite code for a more convenient and memorable one. Codes can only contain latin letters and numbers.",
//             "tillLevelUp": "to level",
//             "currentPercent": "Get from each refill of a referral",
//             "currentReferals": "Current referrals",
//             "currentProfit": "The current earnings from referrals",
//             "yourInviteCode": "Your Invite-Code",
//             "yourInviteLink": "Your invite link",
//             "haveCode": "Got an Invite-Code?",
//             "enterCode": "Enter your invite code",
//             "activate": "Activate",
//             "inviteDesc": "You can receive Invait-code from your friend and enter it only once. The higher the level of ref.system of the code creator, the more balance you will receive! You can not enter your own code.",
//             "levels": {
//               "title": "Total levels",
//               "desc": "The higher the level of the referral system, the more balance you and the users who activate your invite code receive.",
//               "referals": "referrals",
//               "bonus": "$percent% of the amount refilled to you \n \n $money₽ users receive"
//             },
//             "yourReferals": {
//               "title": "Your referrals",
//               "desc": "Statistics of your referrals",
//               "menu": "Place, User, Contributed, Received by you"
//             }
//           },
//           "settings": {
//             "title": "settings",
//             "desc": "Your profile settings",
//             "getMore": "New battle",
//             "avatarTitle": "Set avatar",
//             "avatarDesc": "In order to successfully display your skin from the site you will need to set an avatar \n as in your Standoff 2 account.",
//             "uploadImage": "Upload image"
//           },
//           "upgrades": {
//             "title": "Upgrades",
//             "desc": "You have made $upgradesCount of upgrades",
//             "getMore": "New upgrade"
//           }
//         }
//       },
//       "upgrade": {
//         "title": "Upgrade",
//         "garant": "Guaranteed Prize",
//         "desc": "Give away an item or balance and you get the item of your choice! \n The higher the chance, the greater the possibility of obtaining an item! \n If you lose you get a guaranteed prize!",
//         "youGive": "You give back",
//         "youTake": "You get",
//         "maxPrice": "Maximum price",
//         "chooseSkin1": "Choose an item you wish to upgrade",
//         "chooseSkin2": "Choose the item you want to upgrade",
//         "bonusChance": "You've activated the $chance% upgrade bonus!",
//         "circleText": "Probability of successfully upgrading",
//         "circleTextLose": "Upgrade failed!",
//         "submit": "Upgrade",
//         "tryAgain": "Try again.",
//         "empty": "...empty",
//         "filters": "filters",
//         "hide": "Hide",
//         "show": "Show",
//         "grantedPrize": "Guaranteed prize worth <em>$price1</em> to <em>$price2</em>",
//         "toggle": {
//           "first": "Use balance",
//           "last": "Use skins"
//         },
//         "inventory": {
//           "title1": "Inventory",
//           "title2": "Select an item to receive",
//           "desc": "Total $itemsCount of items",
//           "sideTitle": "Available for exchange:",
//           "sideDesc": "Total $itemsCount items",
//           "action": "Select"
//         }
//       },
//       "support": {
//         "title": "Support",
//         "desc": "Help our users 24/7!",
//         "issues": {
//           "title": "Most frequently asked questions",
//           "desc": "Before you contact support, check out the frequently asked questions below!",
//           "list": [
//             {
//               "summary": "Can I knock out good skins from you?",
//               "content": "Yes, since we are the first case study site in the game Standoff 2 and have been running since June 2019, we have lots of reviews and video reviews on YouTube! After all, if our site couldn't knock out good skins, there wouldn't be so many users opening boxes on it. We don't have any specific systems to win and everything is built on chance. For example, if you fill your balance to just 100 rubles, you can withdraw from the site as the most expensive skin in the game, and completely lose your money. We also broadcast a live feed of the winnings in real time. At StandoffCase everything depends only on your luck!"
//             },
//             {
//               "summary": "How do I open boxes?",
//               "content": "First, log in to the site, top up your balance, and go to the home page of the site. Then choose any box you like and go into it, enter the number of times you want it open and open it normally or quickly to get items into your inventory which you can sell, take out, contract, or upgrade from!"
//             },
//             {
//               "summary": "Can I make a contract?",
//               "content": "Yes, you can make skins swap contracts on the site, just go to contracts, put at least 3 items into a contract, sign and run it! After that you will get a skin in the range of x4 more or less of the amount by which you added your skins! The higher the amount of skins invested, the better skin you can get!"
//             },
//             {
//               "summary": "What are upgrades?",
//               "content": "An upgrade is an opportunity to get a more expensive skin instead of your cheap one! If you lose, you get a guaranteed prize!"
//             },
//             {
//               "summary": "What are battles?",
//               "content": "Battles are an interesting and new way to open a box, where out of 2 participants there is only 1 winner! The idea is that two players open the box at the same time and the player who is luckier and gets the more expensive skin, takes the opponent's skin and his winnings, and the loser gets a guaranteed prize! Thus, instead of 1 box, you open 2 boxes at once at the same price as you would open 1 box!"
//             },
//             {
//               "summary": "How to top up your balance on the site?",
//               "content": "First, log in on the site through any service, it is VKontakte, Twitch, Google, or Facebook. Then in the top right corner click on the button to recharge, or go to your profile, and there click on the button to recharge. Then choose a convenient way to pay and enter the amount of recharge, then if you have a bonus from the reel, then choose it, then you will find yourself on the final recharge page, where you can enter a promo code to recharge the balance if you have one and not selected a bonus, then click on the button recharge and pay. After a successful payment, the funds will be credited to your balance immediately, but if you have any problems, then write to us to support on the website or in the message group in VKontakte!"
//             },
//             {
//               "summary": "How do I remove a skin from the site?",
//               "content": "You need to go to your site profile, then go to the settings and set an avatar, as in your profile of the game Standoff 2, then select the item you want to remove and click on get a skin. Then a window will open with instructions, where you have to choose any skin from the proposed list and put it on the market in the game at the same price as written in the window! For example, if the item costs 100 rubles, the price can be specified as 100.01. The price is specified in kopecks, to make it easier for our moderators to find your item in the game. Then moderators will buy your cheap item on the market in the game at the price you got on the site."
//             },
//             {
//               "summary": "Why can't I display a skin for less than 25 gold?",
//               "content": "This is done so that our moderators will send winnings to the players of the site faster. As soon as Standoff 2 will have exchanges between players, we will immediately add the ability to withdraw skins from 0.01 Gold!"
//             },
//             {
//               "summary": "Me or you take a commission of 20% on the market in the game?",
//               "content": "Our site takes 20% commission on the market in Standoff 2, so you get your winnings in full and without any losses!"
//             },
//             {
//               "summary": "Cooperation",
//               "content": "If you are a youtuber or want to cooperate with our website, then write us on this https://vk.com/standoffcasepartnership page in VKontakte and leave a link to your YouTube channel, as well as tell us which advertising methods you can provide us!"
//             }
//           ]
//         },
//         "help": {
//           "title": "Can't find the answer to your question?",
//           "desc": "Write your question in as much detail as possible in the next field. A support agent will contact you within 24 hours!",
//           "subject": "The question or problem you faced.",
//           "message": "Please give us as much details as possible.",
//           "submit": "Create an inquiry"
//         },
//         "tickets": {
//           "title": "My requests"
//         }
//       },
//       "wheel": {
//         "title": "Bonus Drum",
//         "desc": "Spin the bonus reel for free once every 5 days or enter a secret code to open, each new opening generates 6 random bonuses!",
//         "availableGames": "Spins available",
//         "promocodePlaceholder": "Secret Code",
//         "promocodeButton": "Activate",
//         "promocodeText": "Use secret code and get +1 chance to open",
//         "bonusesTitle": "Your Bonuses",
//         "bonusesDesc": "Get gift bonuses from our site from the bonus reel, they give you cool chips while using our site and make it easier for you to knock out cool skins! \n \n Falling bonuses don't burn out if you don't use them, they can be activated at any time.",
//         "bonusesButton": "My bonuses",
//         "lastBonuses": "Last bonus received",
//         "inventoryTitle": "Bonuses from the bonus reel",
//         "inventoryDesc": "Each new discovery generates 6 random bonuses!",
//         "spinWheel": "Spin Drum",
//         "spinMore": "Spin More",
//         "resetWheel": "Back",
//         "useBonus": "Use",
//         "terms": "Terms and Conditions",
//         "warning1": "You can always check the conditions and your current bonuses in your profile in the <em>bonuses</em>section.",
//         "warning2": "Discounted bonuses do not expire if you do not use them. They can be activated at any time."
//       },
//       "privacy": {
//         "title": "User Agreement",
//         "updated_at": "Updated from",
//         "article1": {
//           "title": "General Terms",
//           "lines": [
//             "1. This Policy defines the procedure of processing and protection by the website standoffcase.net (hereinafter - the Site) of information about individuals (hereinafter - Users), which may be obtained by the Site when the User fills out the registration form on the website standoffcase.net, as well as the websites www.facebook.com, www.twitch.com, www.vk.com and www.google.com.\n\n",
//             "2. The purpose of this Policy is to ensure the proper protection of information about Users, including their personal data, from unauthorized access and disclosure, compliance with legislation on advertising, including when the User receives advertising information.\n\n",
//             "Relationships associated with the collection, storage, distribution and protection of information provided by the User shall be governed by this Policy and the applicable laws of the Russian Federation.\n\n 4.",
//             "4. Personal data, allowed for processing under this Privacy Policy, is provided by the User by filling out the registration form on the Internet site standoffcase.net, and includes the following information: - surname, first name, patronymic of the User; - contact phone number of the User; - email address (e-mail); By filling out the registration form, the User expresses his full consent to the terms of this Policy. Clicking \"Send\", the User agrees to the processing and transfer to the Site of their personal data, left when filling out the registration form on the Internet - site standoffcase.net. The User also agrees to receive advertising information from the Site by any communication channels provided by the User when filling out the registration form on the Internet site standoffcase.net."
//           ]
//         },
//         "article2": {
//           "title": "The purposes of collecting, processing and storing information provided by the Users",
//           "lines": [
//             "Processing of personal data of the User shall be performed in compliance with the legislation of the Russian Federation. The Company processes the User's personal data for the purposes of:\n\n",
//             "1. This Policy defines the procedure of processing and protection of information about individuals (hereinafter referred to as \"Users\"), which may be obtained by the Site when the User fills out the registration form on the website standoffcase.net, as well as on the websites www.facebook.com, www.twitch.com, www.vk.com and www.google.com.\n\n",
//             "1.1. provide the User with information about the services provided by the Site, special offers and other information on behalf of the Site.\n\n"
//           ]
//         },
//         "article3": {
//           "title": "Terms of processing personal information provided by the User",
//           "lines": [
//             "Processing of personal information of the User shall be performed within the term required for the purposes, specified in this Policy, by any lawful means, including information systems with or without the use of means of automation.\n\n",
//             "2. The Site shall take necessary organizational and technical measures to protect the User's personal information from unauthorized or accidental access, destruction, modification, blocking, copying, distribution, as well as from other unlawful actions of third parties.\n\n",
//             "3. Personal information of the User may be transferred to the authorized state bodies of the Russian Federation only on the grounds and in the manner prescribed by the legislation of the Russian Federation.\n\n",
//             "4. The User, when filling out the registration form, confirms that:\n",
//             "4.1. indicates accurate information about himself, all other information is provided by the User at his sole discretion.\n\n",
//             "4.2. is familiar with this Policy, expresses his consent to it. Familiarization with the terms of this Policy and ticking under the link to this Policy is a written consent of the User to the collection, storage and processing of personal data provided by the User.\n\n",
//             "5. The site does not verify the accuracy of received (collected) information about Users, except when such verification is necessary in order to fulfill obligations to the User.\n\n"
//           ]
//         },
//         "article4": {
//           "title": "Changes in Privacy Policy. Applicable Law",
//           "lines": [
//             "1. The Site has the right to modify this Privacy Policy. When making changes in the current edition, the date of the last update is indicated. The new version of the Policy comes into effect from the moment of its posting, unless otherwise stipulated by the new version of the Policy.\n\n",
//             "2. The law of the Russian Federation applies to this Policy and the relations between the User and the Site, arising in connection with the application of the Privacy Policy.\n\n",
//             "3. Prior to recourse to court for disputes arising out of the relationship between the User and the Website, it is mandatory to comply with the claim procedure for dispute resolution.\n\n"
//           ]
//         }
//       }
//     },
//     "termsContacts": {
//       "title": "Контакты",
//       "entries": {
//         "regNumber": "Reg. number:",
//         "beneficiary": "Beneficiary:",
//         "beneficiaryAddress": "Beneficiary’s address:",
//         "domainName": "Доменное имя:",
//         "vkGroup": "Группа ВКонтакте:",
//         "support": "Поддержка:"
//       },
//       "updated_at": "Обновлено от",
//       "intro": "Пожалуйста ознакомьтесь с пользователським соглашением нашего сайта standoffcase.net до начала его использования Авторизация на сайте standoffcase.net осуществляется через учетную запись пользователя VK, Twitch, YouTube, Facebook. Сайт и VK, Twitch, YouTube, Facebook являются разными ресурсами, не подчиненными один другому. Авторизуясь на нашем сайте, Вы автоматически соглашаетесь с пользовательским соглашением сайта Если Вы не согласны с пользовательским соглашением, то просим Вас не авторизирвоаться и не использовать наш сайт! Владелец: Beneficiary: CRYSTAL FUTURE OU, Reg. number: 14198230, Beneficiary’s address: HARJU MAAKOND, TALLINN, KESKLINNA LINNAOSA, PIKK TN 7-5, 10123",
//       "article1": {
//         "title": "1. Термины и определения",
//         "lines": [
//           "1.1. В настоящем Соглашении, если из текста прямо не вытекает иное, следующие термины будут иметь указанные ниже значения:",
//           "1.2. Сайт - совокупность информации, текстов, графических элементов, дизайна, изображений, фото и видеоматериалов и иных результатов интеллектуальной деятельности, а также программ для ЭВМ, содержащихся в информационной системе, обеспечивающей доступность такой информации в сети интернет по сетевому адресу standoffcase.net, так же наш сайт является интернет-ресурсом, предназначенным для оказания развлекательно-аттракционных услуг физическим лицам и не является сайтом для азартных игр, так как на сайте нельзя умножить и вывести реальные деньги!",
//           "1.3. Названия заголовков (статей) соглашения предназначены исключительно для удобства пользования текстом, соглашения и буквального юридического значения не имеют.",
//           "1.4. Кейс – безрискованная составляющая сайта с гарантированным выигрышем, открыв который можно получить предметы (скины) в свой личный инвентарь на сайте для дальнейшего их вывода в игру Standoff 2!",
//           "1.5. Скин – виртуальный инвентарь многопользовательской, мобильной сетевой игры Standoff 2, на Сайте возможно использование виртуальных игровых атрибутов (виртуального инвентаря сетевой игры Standoff 2 и их элементы) - предоставленный Администратором Пользователю на безвозмездной основе по правилам Сайта.",
//           "1.6. Баланс - виртуальный игровой баланс – сумма счета каждого игрока, который возможно увеличить, но невозможно вернуть обратно в реальные деньги, а лишь обменять на виртуальные предметы, данный баланс становится доступен после авторизации пользователя на сайте.",
//           "1.7. Все остальные термины и определения, встречающиеся в тексте соглашения, толкуются сторонами в соответствии с законодательством Российской Федерации и сложившимися в сети интернет обычными правилами толкования соответствующих терминов."
//         ]
//       },
//       "article2": {
//         "title": "2. Предмет соглашения",
//         "lines": [
//           "2.1. Администратор предоставляет пользователю:",
//           "2.1.1 безвозмездную простую (неисключительную) лицензию на использование сайта и его программных средств по их прямому назначению, как то предусмотрено явными пользовательскими функциями сайта и личного кабинета;",
//           "2.1.2 возмездную простую (неисключительную) лицензию на использование кейса по его прямому назначению, при этом стоимость лицензии на использование определенного кейса указана на сайте.",
//           "2.2 Указанная в пункте 2.1.1 соглашения лицензия предоставляется пользователю на срок, в течение которого, и в пределах территории, на которой сайт и личный кабинет остаются доступными для пользователя.",
//           "2.3. Указанная в пункте 2.1.2 соглашения лицензия предоставляется пользователю в пределах территории, на которой кейс остается доступным для пользователя в течение срока с момента оплаты пользователем вознаграждения за использование конкретного кейса до момента определения инвентаря с помощью такого кейса.",
//           "2.4. Пользователю запрещается:",
//           "2.4.1 обходить технические ограничения, установленные на сайте и в кейсе;",
//           "2.4.2 изучать технологию, декомпилировать или дизассемблировать сайт, кейс и личный кабинет, за исключением случаев, прямо предусмотренных законодательством российской федерации;",
//           "2.4.3 создавать копии экземпляров сайта, кейсов и личного кабинета, а также их внешнего оформления (дизайна);",
//           "2.4.4 изменять сайт, кейсы и личный кабинет каким бы то ни было способом;",
//           "2.4.5 совершать действия, направленные на изменение функционирования и работоспособности сайта;",
//           "2.4.6 предоставлять доступ к личному кабинету третьему лицу;",
//           "2.4.7 осуществлять указанные выше действия в отношении любой части сайта."
//         ]
//       },
//       "article3": {
//         "title": "3. Функции Сайта, Кейса и Личного кабинета",
//         "lines": [
//           "3.1. Пользователь посредством Сайта имеет возможность:",
//           "3.1.1. знакомиться с содержанием и характеристиками инвентаря, выбор которого происходит посредством определенного кейса, и стоимостью лицензии на использование такого кейса;",
//           "3.1.1. приобретать лицензию на использование кейса и получать соответствующий инвентарь в порядке, указанном в соглашении."
//         ]
//       },
//       "article4": {
//         "title": "4. Особые условия",
//         "lines": [
//           "4.1. Сайт может содержать ссылки на другие сайты в сети интернет (сайты третьих лиц). Указанные третьи лица и их контент не проверяются администратором на соответствие тем или иным требованиям (достоверности, полноты, законности и т.п.). Администратор не несет ответственности за любую информацию, материалы, размещенные на сайтах третьих лиц, к которым пользователь получает доступ в связи с использованием сайта, в том числе: за любые мнения или утверждения, выраженные на сайтах третьих лиц, рекламу и т.п., а также за доступность таких сайтов или контента и последствия их использования пользователем.",
//           "4.2. Администратор не гарантирует, что сайт соответствует требованиям пользователя, что доступ к сайту будет предоставляться непрерывно, быстро, надежно и без ошибок. Программно-аппаратные ошибки, как на стороне администратора, так и на стороне пользователя, приведшие к невозможности получения пользователем доступа к сайту и/или личному аккаунту пользователя на сайте, являются обстоятельствами непреодолимой силы и основанием освобождения от ответственности за неисполнение обязательств администратором по соглашению.",
//           "4.2. Пользователь посредством кейса имеет возможность получить один из предоставленных на странице, содержащей кейс, инвентарей. Инвентарь для получения пользователем определяется автоматически посредством использования кейса.",
//           "4.3. Администратор вправе уступать права и переводить долги по всем обязательствам, возникшим из соглашения. Настоящим пользователь дает свое согласие на уступку прав и перевод долга любым третьим лицам. О состоявшейся уступке прав и/или переводе долга администратор информирует пользователя, размещая соответствующую информацию на сайте и такое уведомление стороны признают достаточным.",
//           "4.3. Администратор вправе отказать любому пользователю в обслуживании на сайте без объяснения причин.",
//           "4.3. Пользователь посредством Личного кабинета имеет возможность:",
//           "4.3.1. принять Инвентарь в аккаунт Standoff 2;",
//           "4.4. В некоторых случаях использования сайта (в том числе, но, не ограничиваясь: в случае возникновения спора между сторонами, в случае предоставления пользователю каких-либо эксклюзивных опций на сайте и в иных случаях, перечень не закрытый) Администратором может быть предложено пользователю сообщить администратору персональные данные пользователя. В этом случае, предоставляя свои персональные данные, пользователь тем самым соглашается (без совершения на то каких бы то ни было дополнительных формальных процедур кроме акцепта настоящего соглашения) на то, что администратор вправе обрабатывать персональные данные, предоставленные Пользователем, т.е. совершать любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных, предоставленных пользователем"
//         ]
//       },
//       "article5": {
//         "title": ">5. Персональные данные",
//         "lines": [
//           "5.1. Пользователь дает свое согласие администратору на обработку информации, в том числе, персональных данных пользователя, предоставленных при использовании сайта, а именно данных, указанных в аккаунте пользователя в VK и Standoff 2.",
//           "5.1. Обработка персональных данных означает запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), в том числе трансграничную, обезличивание, блокирование, удаление, уничтожение персональных данных, не подпадающих под специальные категории, на обработку которых, согласно действующему законодательству Российской Федерации, требуется письменное согласие пользователя.",
//           "5.1. Обработка персональных данных производится в целях исполнения Сторонами обязательств по соглашению, регистрации пользователя на сайте, приобретения лицензии на использование кейса, получения инвентаря, направления на адрес электронной почты пользователя сообщений информационного и иного характера.",
//           "5.1. Пользователь может в любое время отозвать согласие на обработку персональных данных, направив администратору соответствующее письменное уведомление на адрес yes@standoffcasesupport.ru заказным письмом с уведомлением о вручении. При этом пользователь понимает, что такой отзыв означает прекращение действия соглашения. Администратор вправе продолжить обработку персональных данных пользователя в предусмотренных законом случаях.",
//           "5.1. Дополнительные или иные положения в отношении обработки персональных данных могут содержаться в соответствующем документе, размещенном или размещаемом на Сайте. В случае, противоречия положений такого документа положениям настоящего раздела применяются положения документа.",
//           "5.1. Пользователь дает согласие на получение рекламных материалов от администратора, его аффилированных лиц либо от иных лиц по поручению администратора на адрес электронной почты, указанный пользователем при регистрации в аккаунте VK, YouTube, Twitch, Facebook. Согласие на получение рекламных материалов может быть отозвано пользователем в любое время путем направления администратору соответствующего письменного уведомления на адрес yes@standoffcasesupport.ru, либо путем совершения действий, указанных в сообщениях (электронных письмах), содержащих такие материалы."
//         ]
//       },
//       "article6": {
//         "title": "6. Порядок разрешения споров",
//         "lines": [
//           "6.1. Все споры, разногласия и претензии, которые могут возникнуть в связи с исполнением, расторжением или признанием недействительным соглашения, стороны будут стремиться решить путем переговоров. Сторона, у которой возникли претензии и/или разногласия, направляет другой стороне сообщение с указанием возникших претензий и/или разногласий в соответствии с пунктом ",
//           "6.2. В случае если ответ на сообщение не будет получен направившей сообщение стороной в течение 30 (тридцати) рабочих дней с даты направления соответствующего сообщения, либо если стороны не придут к соглашению по возникшим претензиям и/или разногласиям, спор подлежит разрешению в судебном порядке по месту нахождения администратора."
//         ]
//       },
//       "article7": {
//         "title": "7. Заключительные положения",
//         "lines": [
//           "7.1. Настоящим Стороны подтверждают, что при исполнении (изменении, дополнении, прекращении) соглашения, а также при ведении переписки по указанным вопросам, допускается использование аналогов собственноручной подписи сторон. Стороны подтверждают, что все уведомления, сообщения, соглашения и документы в рамках исполнения сторонами обязательств, возникших из соглашения, подписанные аналогами собственноручной подписи сторон, имеют юридическую силу и обязательны для исполнения сторонами. Под аналогами собственноручной подписи понимаются уполномоченные адреса электронной почты и учетные данные к личному кабинету.",
//           "7.2. Стороны признают, что все уведомления, сообщения, соглашения, документы и письма, направленные с использованием уполномоченных адресов электронной почты и личного кабинета, считаются направленными и подписанными сторонами, кроме случаев, когда в таких письмах прямо не указано обратное.",
//           "7.3. Уполномоченными адресами электронной почты Сторон признаются:",
//           "7.3.1 для администратора: yes@standoffcasesupport.ru",
//           "7.3.2 для пользователя: адрес электронной почты, указанный при регистрации аккаунта в VK, Twitch, YouTube, Facebook",
//           "7.4. Стороны обязуются обеспечивать конфиденциальность сведений и информации, необходимых для доступа к уполномоченным адресам электронной почты и личному кабинету, не допускать разглашение такой информации и передачу третьим лицам. Стороны самостоятельно определяют порядок ограничения доступа к такой информации.",
//           "7.5. При использовании уполномоченных адресов электронной почты, до момента получения от второй стороны информации о нарушении режима конфиденциальности, все действия и документы, совершенные и направленные с помощью уполномоченного адреса электронной почты второй стороны, даже если такие действия и документы были совершены и направлены иными лицами, считаются совершенными и направленными такой второй стороной. В этом случае права и обязанности, а также ответственность наступают у такой второй стороны.",
//           "7.6. При использовании личного кабинета, до момента получения от пользователя информации о нарушении режима конфиденциальности, все действия и документы, совершенные и направленные с помощью личного кабинета, даже если такие действия и документы были совершены и направлены иными лицами, считаются совершенными и направленными пользователем. В этом случае права и обязанности, а также ответственность наступают у пользователя."
//         ]
//       },
//       "article8": {
//         "title": "8. Функции Сайта",
//         "lines": [
//           "8.1. Администратор вправе в одностороннем порядке изменять условия соглашения, при этом такие изменения вступают в силу в момент опубликования новой версии соглашения в сети интернет по адресу https://standoffcase.net/agreement",
//           "8.2. Продолжение использования функций сайта будет означать согласие пользователя с условиями новой версии соглашения. Если пользователь не согласен с условиями новой версии соглашения, он прекращает пользоваться сайтом.",
//           "8.3. Во всем остальном, что не урегулировано соглашением, стороны руководствуются действующим законодательством Российской Федерации без учета его коллизионных норм."
//         ]
//       }
//     },
//     "themes": {
//       "unique": {
//         "title": "Unique Series",
//         "desc": "Exclusive boxes from StandoffCase"
//       },
//       "free": {
//         "title": "Free Series",
//         "desc": "Gift boxes from StandoffCase"
//       },
//       "rank": {
//         "title": "Competition Mode",
//         "desc": "Matchmaking Rank Boxes"
//       },
//       "bonus": {
//         "title": "Bonus Boxes",
//         "desc": "Boxes with your favorite cards from the game"
//       },
//       "sborki": {
//         "title": "Our Assemblies",
//         "desc": "Crates assembled by the project team"
//       },
//       "farms": {
//         "title": "Farm Boxes",
//         "desc": "Boxes from which you can cheaply knock out expensive skins"
//       },
//       "youtubers": {
//         "title": "Youtuber crates",
//         "desc": "Youtuber crates of Standoff 2"
//       },
//       "standart": {
//         "title": "Standard Crates",
//         "desc": "All Standoff 2 Crate Collections"
//       }
//     },
//     "caseStates": {
//       "message": "To open the box you need to",
//       "VKAuth": "To perform actions, you need to log in through VK",
//       "VKButton": "Sign in",
//       "conditions": {
//         "1": {
//           "text": "Subscribe to the community StandoffCase VKontakte.",
//           "button": "Subscribe"
//         },
//         "2": {
//           "text": "Enable message permission from the StandoffCase VKontakte community.",
//           "button": "Turn on"
//         },
//         "3": {
//           "text": "Top up your balance for today with",
//           "button": "Go to"
//         },
//         "4": {
//           "text": "Invite friends with referral link",
//           "button": "Go to"
//         },
//         "5": {
//           "text": "Raise Level",
//           "button": "Learn more"
//         },
//         "9": {
//           "text": "Raise level today",
//           "button": "Learn more"
//         },
//         "10": {
//           "text": "Open any paid boxes today",
//           "button": "Go to"
//         },
//         "11": {
//           "text": "Create exchange contracts today",
//           "button": "Go to"
//         },
//         "12": {
//           "text": "Make upgrades today",
//           "button": "Go to"
//         },
//         "13": {
//           "text": "Fight today's battles",
//           "button": "Go to"
//         },
//         "14": {
//           "text": "Invite friends through a ref.link",
//           "button": "Jump"
//         },
//         "15": {
//           "text": "Withdraw any item today",
//           "button": "Jump to"
//         },
//         "16": {
//           "text": "Sell any items dropped from pay boxes today",
//           "button": "Jump to"
//         },
//         "17": {
//           "text": "Replenish balance for today",
//           "button": "Jump to"
//         },
//         "18": {
//           "text": "Drop any items today",
//           "button": "Jump"
//         }
//       }
//     },
//     "cases": {
//       "1": {
//         "title": "Emulator",
//         "desc": "A box for fans to play from the emulator!"
//       },
//       "2": {
//         "title": "Champion",
//         "desc": "A box for those who love competitive mode!"
//       },
//       "3": {
//         "title": "Phoenix",
//         "desc": "A crate for those who love competitive mode!"
//       },
//       "4": {
//         "title": "Silver",
//         "desc": "A box for those who love competitive mode!"
//       },
//       "5": {
//         "title": "Bronze",
//         "desc": "The box for those who love competitive mode!"
//       },
//       "6": {
//         "title": "Star",
//         "desc": "The box for those who love competitive mode!"
//       },
//       "18": {
//         "title": "Salvation",
//         "desc": ""
//       },
//       "125": {
//         "title": "Free every 24 hours",
//         "desc": "Free every 24 hours, you need to subscribe \n to the standoffcase.netmunity on VKontakte and allow messages!"
//       },
//       "126": {
//         "title": "Free every hour",
//         "desc": "Free for every hour with balance refill from 200 rubles!"
//       },
//       "127": {
//         "title": "Free of charge every 2 days",
//         "desc": "Free every 2 days if invited more than 15 people using Ref.Link!"
//       },
//       "128": {
//         "title": "Free every 3 days",
//         "desc": "Free of charge every 3 days if referral is made from 10 levels!"
//       },
//       "129": {
//         "title": "Free 1 time per day",
//         "desc": "Free 1 time per day if you meet random conditions!"
//       },
//       "131": {
//         "title": "Legend",
//         "desc": "A box for those who like competitive mode!"
//       },
//       "132": {
//         "title": "Phone",
//         "desc": "A box for those who like to play from their phone!"
//       },
//       "133": {
//         "title": "Cybersport",
//         "desc": "A box to celebrate the development of cybersports in the game!"
//       },
//       "134": {
//         "title": "Tablet",
//         "desc": "A crate for those who love to play from a tablet!"
//       },
//       "135": {
//         "title": "Clan Battle",
//         "desc": "A crate for those who are members of a clan!"
//       },
//       "136": {
//         "title": "Cheater",
//         "desc": "A box for those who don't want to play with cheaters!"
//       },
//       "137": {
//         "title": "Cheater",
//         "desc": "A box for those who don't want to deal with cheaters!"
//       },
//       "138": {
//         "title": "MVP",
//         "desc": "The box that attracts the luck to become a better player!"
//       },
//       "139": {
//         "title": "Bombastic",
//         "desc": "A drawer for those who don't want to forget the bomb code!"
//       },
//       "140": {
//         "title": "Axlebolt",
//         "desc": "A crate for making Standoff 2 release more updates!"
//       },
//       "141": {
//         "title": "Lucky",
//         "desc": "A crate for making sure the game never lags!"
//       },
//       "142": {
//         "title": "Veteran",
//         "desc": "A box for those who want to become or are already veterans of the game!"
//       },
//       "143": {
//         "title": "Province",
//         "desc": "A crate for those who like to play Province!"
//       },
//       "144": {
//         "title": "Bonus",
//         "desc": "Appears every 2 hours with random skins, have time to open it!"
//       },
//       "145": {
//         "title": "SandStone",
//         "desc": "A crate for those who love to play on SandStone!"
//       },
//       "146": {
//         "title": "Rust",
//         "desc": "A crate for people who love to play on Rust!"
//       },
//       "148": {
//         "title": "Zone 9",
//         "desc": "A crate for people who love playing on Zone 9!"
//       },
//       "149": {
//         "title": "Arena",
//         "desc": "The box for those who love playing the Arena!"
//       },
//       "150": {
//         "title": "Training outside",
//         "desc": "A box for those who love to play on Training outside!"
//       },
//       "151": {
//         "title": "Rare",
//         "desc": "The box that holds all the rare rarity items!"
//       },
//       "152": {
//         "title": "Legendary",
//         "desc": "The box that holds all legendary quality items!"
//       },
//       "153": {
//         "title": "Epic",
//         "desc": "The box containing all epic quality items!"
//       },
//       "154": {
//         "title": "Arcane",
//         "desc": "The box containing all arcane quality items!"
//       },
//       "155": {
//         "title": "USP",
//         "desc": "The box that holds all USP weapon skins!"
//       },
//       "156": {
//         "title": "G22",
//         "desc": "The box that holds all G22 weapon skins!"
//       },
//       "157": {
//         "title": "FnFal",
//         "desc": "The box that holds all FnFal weapon skins!"
//       },
//       "158": {
//         "title": "Famas",
//         "desc": "The box containing all skins of Famas weapons!"
//       },
//       "159": {
//         "title": "AKR",
//         "desc": "The box containing all of AKR weapon skins!"
//       },
//       "160": {
//         "title": "M4",
//         "desc": "The box containing all M4 weapon skins!"
//       },
//       "161": {
//         "title": "AWM",
//         "desc": "The AWM collection box containing all AWM skins!"
//       },
//       "162": {
//         "title": "UMP45",
//         "desc": "The box containing all skins of UMP45!"
//       },
//       "163": {
//         "title": "Farm Knife",
//         "desc": "The box containing all knife skins!"
//       },
//       "164": {
//         "title": "Farm Gloves",
//         "desc": "The box with all of our glove skins!"
//       },
//       "165": {
//         "title": "Farm USP Genesis",
//         "desc": "A box where you can get USP Genesis for cheap!"
//       },
//       "166": {
//         "title": "Farm AWM Sport V2",
//         "desc": "Cheapest AWM Sport V2 Crate!"
//       },
//       "167": {
//         "title": "Farm M9 Bayonet Dragon Glass",
//         "desc": "The box where you can get M9 Bayonet Dragon Glass on the cheap!"
//       },
//       "168": {
//         "title": "Farm Butterfly Legacy",
//         "desc": "A crate where you can get Butterfly Legacy on the cheap!"
//       },
//       "169": {
//         "title": "Farm G22 Relic",
//         "desc": "The crate where you can get G22 Relic on the cheap!"
//       },
//       "170": {
//         "title": "Farm Gloves Neuro!",
//         "desc": "The crate where you can get Gloves Neuro on the cheap!"
//       },
//       "180": {
//         "title": "Competition Mode",
//         "desc": "A crate for those who love to play in competition mode!"
//       },
//       "181": {
//         "title": "Slave",
//         "desc": "A drawer for those who never want to become a slave!"
//       },
//       "182": {
//         "title": "Gypsy",
//         "desc": "A drawer for those who don't want to get caught by Gypsy!"
//       },
//       "183": {
//         "title": "Major",
//         "desc": "Box for those who want to play with the best skins!"
//       },
//       "184": {
//         "title": "Washing",
//         "desc": "Box in honor of trolling the game Standoff 2!"
//       },
//       "185": {
//         "title": "StandoffMarket.ru",
//         "desc": "StandoffMarket.ru drawer where you can buy and sell gold!"
//       },
//       "186": {
//         "title": "Stickers",
//         "desc": "Box where you can buy and sell stickers of the game!"
//       },
//       "187": {
//         "title": "Keyrings",
//         "desc": "Box containing all keyrings of the game!"
//       },
//       "188": {
//         "title": "Nameless",
//         "desc": "The box containing all of the skins from the Nameless collection!"
//       },
//       "189": {
//         "title": "StatTrack",
//         "desc": "The box in which all StatTrack skins are collected!"
//       },
//       "190": {
//         "title": "Coronavirus Get Away!",
//         "desc": "A crate in honor of Coronavirus go away soon!"
//       },
//       "191": {
//         "title": "Tick Tock.",
//         "desc": "A crate for fans of watching Tic Tacs!"
//       },
//       "192": {
//         "title": "Origin",
//         "desc": "A crate containing all the Origin collection skins!"
//       },
//       "193": {
//         "title": "Furious",
//         "desc": "The box of all skins from the Furious collection!"
//       },
//       "194": {
//         "title": "Rival",
//         "desc": "The box containing all skins from Rival!"
//       },
//       "195": {
//         "title": "Scorpion",
//         "desc": "The box containing all skins from Scorpion collection!"
//       },
//       "196": {
//         "title": "Fable",
//         "desc": "The one case contain all skins from Fable!"
//       },
//       "197": {
//         "title": "Z9 Project",
//         "desc": "The Z9 Project collection skinny box!"
//       },
//       "198": {
//         "title": "Revival",
//         "desc": "The box containing all skins from the Revival collection!"
//       },
//       "199": {
//         "title": "Homeless",
//         "desc": "A crate in honor of always having skins and a home!"
//       },
//       "200": {
//         "title": "Banned",
//         "desc": "Box in honor of not getting banned for nothing!"
//       },
//       "201": {
//         "title": "Aboven",
//         "desc": "Youtuber Aboven's box!"
//       },
//       "202": {
//         "title": "Rick",
//         "desc": "Youtuber Rick's crate!"
//       },
//       "203": {
//         "title": "Velja",
//         "desc": "Youtuber Velja's crate!"
//       },
//       "204": {
//         "title": "Tic Tac's",
//         "desc": "Tic Tac's youtuber's crate!"
//       },
//       "205": {
//         "title": "Lucik",
//         "desc": "Lucik's youtuber's box!"
//       },
//       "206": {
//         "title": "Snay",
//         "desc": "Youtuber Snay's crate!"
//       },
//       "207": {
//         "title": "Booster",
//         "desc": "Booster's youtuber crate!"
//       },
//       "208": {
//         "title": "Cartoons",
//         "desc": "A box for cartoon lovers!"
//       },
//       "209": {
//         "title": "Vaccine",
//         "desc": "A crate celebrating the development of the vaccine!"
//       },
//       "210": {
//         "title": "Empire",
//         "desc": "A box from update 0.16.0 Standoff 2!"
//       }
//     },
//     "bonuses": {
//       "get": "Get",
//       "list": {
//         "1": {
//           "title": "x2 multiplication to your balance",
//           "notify": "You have applied x2 to your balance",
//           "hints": [
//             "When you top up, your balance is multiplied by x2!",
//             "Say you deposit 100 ₽ and get 200 ₽.",
//             "The more you top up, the better the bonus!"
//           ]
//         },
//         "2": {
//           "title": "x3 multiplication to top up",
//           "hints": [
//             "When you top up, your balance is multiplied by x3 times!",
//             "Let's say you deposit 500 ₽ and get 1500 ₽.",
//             "The higher the amount you deposit, the better the bonus!"
//           ]
//         },
//         "3": {
//           "title": "x5 multiplication to top up",
//           "hints": [
//             "Your balance is multiplied by 5 times when you top up!",
//             "Let's say you deposit 1000 ₽ and get 5000 ₽.",
//             "The bigger the amount you deposit, the better the bonus!"
//           ]
//         },
//         "4": {
//           "title": "10 ₽ credit to your balance for free.",
//           "hints": [
//             "Once you activate, you get +10 ₽ to your balance for free!",
//             "These can be spent on crates, upgrades, battles, and more."
//           ]
//         },
//         "5": {
//           "title": "Get +100 ₽ credit for free.",
//           "hints": [
//             "Once activated, you get +100 ₽ to your balance for free!",
//             "These can be spent on crates, upgrades, battles, and more."
//           ]
//         },
//         "6": {
//           "title": "Get 1000 ₽ credit for free.",
//           "hints": [
//             "Get +1000 ₽ to your balance for free once you activate it.",
//             "These can be spent on crates, upgrades, battles, and more."
//           ]
//         },
//         "7": {
//           "title": "10000 ₽ to balance for free.",
//           "hints": [
//             "Get +10000 ₽ to your balance for free after activation.",
//             "This can be spent on crates, upgrades, battles, and more."
//           ]
//         },
//         "8": {
//           "title": "Zeroing the timer for free crate every 24 hours",
//           "hints": [
//             "Once activated, the timer for the free crate is completely reset!"
//           ]
//         },
//         "9": {
//           "title": "Opening a Random Box",
//           "hints": [
//             "Once activated, you will be able to open a random crate for free!",
//             "The resulting item can be sold, taken out, contracted, or upgraded!"
//           ]
//         },
//         "10": {
//           "title": "Opening a Farmknife Crate",
//           "hints": [
//             "Once activated, you will be able to open a farmknife box for free!",
//             "The obtained item can be sold, withdrawn, make a contract or upgrade!"
//           ]
//         },
//         "11": {
//           "title": "+10% to the chance to upgrade your skin!",
//           "hints": [
//             "Once activated, you get a +10% chance to successfully upgrade!",
//             "Bonus applies to just 1 upgrade created through balance or item."
//           ]
//         },
//         "12": {
//           "title": "+10% cashback on case openings within 1 hour",
//           "hints": [
//             "Once activated, you get +10% cashback when you open cases!",
//             "This means that 10% of the amount will be returned to your balance.",
//             "Bonus is valid when you open any paid crate!"
//           ]
//         },
//         "13": {
//           "title": "Random Skin for Free",
//           "hints": [
//             "Once activated, you get a random item in your profile for free!",
//             "The price of the item ranges from 0.01 ₽ to the most expensive item.",
//             "You can sell it, take it out, use it in an upgrade and contract!"
//           ]
//         },
//         "14": {
//           "title": "One more try",
//           "hints": [
//             "Once activated, you get +1 try for the bonus reel."
//           ]
//         },
//         "15": {
//           "title": "3 random skins when you deposit ₽500 or more",
//           "hints": [
//             "Once activated, you get 3 random items when you top up from ₽500!",
//             "Items range in price from 0.01 ₽ to the most expensive items.",
//             "They can be sold, withdrawn, used in upgrades and contract!"
//           ]
//         },
//         "16": {
//           "title": "1 random box when you top up from 50 ₽",
//           "hints": [
//             "Once activated, you will receive 1 random crate when you top up 50 ₽ or more!",
//             "This crate will be displayed on the main subject of free crates.",
//             "Boxes are priced from the lowest price, to the most expensive!",
//             "Item from the crate can be sold, withdrawn, used in an upgrade and contract!"
//           ]
//         },
//         "17": {
//           "title": "2 random crates when you top up from 150 ₽.",
//           "hints": [
//             "Once activated, you will receive 2 random boxes when you top up with ₽150 or more!",
//             "These crates will be displayed on the main subject of free crates.",
//             "Boxes are priced from the lowest price, to the most expensive!",
//             "Items from the crate can be sold, withdrawn, used in upgrades and contract!"
//           ]
//         },
//         "18": {
//           "title": "3 random boxes with a minimum top-up of ₽300.",
//           "hints": [
//             "Once activated, you get 3 random cases when you top up with ₽300 or more!",
//             "These crates will be displayed on the homepage under the subject of free crates.",
//             "Boxes are priced from the lowest price, to the most expensive!",
//             "Items from the crate can be sold, withdrawn, used in the upgrade and contract!"
//           ]
//         },
//         "19": {
//           "title": "2 Contract Items.",
//           "hints": [
//             "Once activated, you get 2 random items for a contract!",
//             "Prices range from 0.01 ₽ to the most expensive items.",
//             "These items can only be used in contract!"
//           ]
//         },
//         "20": {
//           "title": "+20 ₽ to balance, with a minimum top up of 50 ₽.",
//           "hints": [
//             "Once activated, you must top up your balance of 50 ₽ or more!",
//             "Bonus of +20 ₽ is given instantly after topping up.",
//             "You can spend it on crates, upgrades, battles, and more."
//           ]
//         },
//         "21": {
//           "title": "Deposit +40 ₽ when you deposit ₽100 or more.",
//           "hints": [
//             "You'll need to top up your balance of ₽100 after activation!",
//             "Bonus of +40 ₽ is given instantly after topping up.",
//             "You can spend it on crates, upgrades, battles, and more."
//           ]
//         },
//         "22": {
//           "title": "+60 ₽ to your balance, with a minimum top-up of 150 ₽.",
//           "hints": [
//             "You must top up your balance of ₽150 after activation!",
//             "Bonus of +60 ₽ is given instantly after topping up.",
//             "You can spend it on crates, upgrades, battles, and more."
//           ]
//         },
//         "23": {
//           "title": "+100 ₽ to your balance, if you deposit at least 250 ₽.",
//           "hints": [
//             "You'll need to top up your balance of ₽250 after activation!",
//             "Bonus of +100 ₽ is given instantly after topping up.",
//             "They can be spent on crates, upgrades, battles and more."
//           ]
//         },
//         "24": {
//           "title": "+1 LVL profile on the site",
//           "hints": [
//             "After activation you'll get +1 LVL profile on the site!",
//             "The bonus is given instantly after activation.",
//             "Increasing your level, you get the best bonuses from the site."
//           ]
//         },
//         "25": {
//           "title": "Free balance ticket +1 ₽.",
//           "hints": [
//             "After activation you get +1 ₽ to your balance for free!",
//             "The bonus is issued instantly upon activation.",
//             "You can spend it on crates, upgrades, battles, and more."
//           ]
//         },
//         "26": {
//           "title": "Free balance ticket +2 ₽",
//           "hints": [
//             "Once activated, you get +2 ₽ to your balance for free!",
//             "The bonus is issued instantly upon activation.",
//             "You can spend it on crates, upgrades, battles, and more."
//           ]
//         },
//         "27": {
//           "title": "Free balance ticket +3 ₽",
//           "hints": [
//             "After activation, you get +3 ₽ to your balance for free!",
//             "The bonus is issued instantly after activation.",
//             "They can be spent on crates, upgrades, battles and more."
//           ]
//         },
//         "28": {
//           "title": "Free balance ticket +4 ₽",
//           "hints": [
//             "After activation, you get +4 ₽ to your balance for free!",
//             "The bonus is issued instantly upon activation.",
//             "They can be spent on crates, upgrades, battles, and more."
//           ]
//         },
//         "29": {
//           "title": "Free balance ticket +5 ₽",
//           "hints": [
//             "Once activated, you get +5 ₽ to your balance for free!",
//             "The bonus is issued instantly upon activation.",
//             "You can spend it on crates, upgrades, battles, and more."
//           ]
//         },
//         "30": {
//           "title": "Free balance ticket +6 ₽",
//           "hints": [
//             "Once activated, you get +6 ₽ to your balance for free!",
//             "The bonus is issued instantly upon activation.",
//             "You can spend it on crates, upgrades, battles, and more."
//           ]
//         },
//         "31": {
//           "title": "Free balance ticket +7 ₽",
//           "hints": [
//             "After activation, you get +7 ₽ to your balance for free!",
//             "The bonus is issued instantly after activation.",
//             "They can be spent on crates, upgrades, battles, and more."
//           ]
//         },
//         "32": {
//           "title": "Free balance ticket +8 ₽",
//           "hints": [
//             "Once activated, you get +1 ₽ to your balance for free!",
//             "The bonus is issued instantly upon activation.",
//             "You can spend it on crates, upgrades, battles, and more."
//           ]
//         },
//         "33": {
//           "title": "Free balance ticket +9 ₽",
//           "hints": [
//             "Once activated, you get +9 ₽ to your balance for free!",
//             "The bonus is issued instantly upon activation.",
//             "You can spend it on crates, upgrades, battles, and more."
//           ]
//         },
//         "34": {
//           "title": "Random Paid Box Ticket.",
//           "hints": [
//             "Once activated, you will be able to open a random pay box for free!",
//             "The bonus is issued instantly upon activation.",
//             "The resulting item can be sold, taken out, contracted, or upgraded!"
//           ]
//         },
//         "35": {
//           "title": "Ticket for +1 item to contract",
//           "hints": [
//             "Once activated, you will receive a random item in a contract!",
//             "The bonus is given instantly after activation.",
//             "The item will be immediately in the contract, you do not need to do anything."
//           ]
//         },
//         "36": {
//           "title": "Ticket for a random item",
//           "hints": [
//             "You will get a random item in your profile for free after activation!",
//             "The price of the item ranges from 0.01 ₽ to the most expensive item.",
//             "You can sell it, take it out, use it to upgrade and contract it!"
//           ]
//         },
//         "37": {
//           "title": "Farmknife Box Ticket",
//           "hints": [
//             "Once activated, you will be able to open a box of farmknife for free!",
//             "The resulting item can be sold, taken out, contracted or upgraded!"
//           ]
//         },
//         "38": {
//           "title": "Bonus Knife Box Ticket",
//           "hints": [
//             "Once activated, you will receive a random bonus drawer for free!",
//             "The resulting item can be sold, taken out, contracted, or upgraded!"
//           ]
//         },
//         "39": {
//           "title": "Ticket to create a battle",
//           "hints": [
//             "Once activated, you can create a battle for free!",
//             "The bonus is issued instantly after activation.",
//             "Go to the battle and click create at the crates with a price of 0."
//           ]
//         },
//         "40": {
//           "title": "Ticket to enter the battle",
//           "notify": "You have applied x2 to your balance",
//           "hints": [
//             "Once activated, you will be able to enter the battle for free!",
//             "The bonus is issued instantly after activation.",
//             "Go to the battle and press enter at the boxes with a price of 0."
//           ]
//         }
//       }
//     },
//     "battle": {
//       "user_status": {
//         "host": "Creator",
//         "opponent": "Adversary",
//         "searching": "Searching for the enemy ..."
//       }
//     },
//     "statistics": {
//       "cases": "Opened crates",
//       "contracts": "Contracts",
//       "battles": "Battles",
//       "upgrades": "Upgrades",
//       "users": "Users",
//       "online": "Online"
//     }
//   }
// })
