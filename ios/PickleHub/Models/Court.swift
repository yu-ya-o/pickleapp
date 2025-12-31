import Foundation

// MARK: - Court Model
struct Court: Codable, Identifiable {
    let id: String
    let name: String
    let description: String
    let imageUrl: String
    let imageUrls: [String]
    let region: String
    let address: String
    let latitude: Double?
    let longitude: Double?
    let phoneNumber: String?
    let websiteUrl: String?
    let email: String?
    let courtsCount: Int?
    let indoorOutdoor: String?
    let surface: String?
    let amenities: [String]
    let operatingHours: String?
    let priceInfo: String?
    let status: CourtStatus
    let listingPlan: ListingPlan
    let freeUntil: String?
    let createdAt: String
    let updatedAt: String

    var indoorOutdoorDisplayText: String {
        switch indoorOutdoor {
        case "indoor":
            return "屋内"
        case "outdoor":
            return "屋外"
        case "both":
            return "屋内/屋外"
        default:
            return "不明"
        }
    }

    var amenitiesDisplayText: [String] {
        amenities.compactMap { amenity in
            switch amenity {
            case "parking":
                return "駐車場"
            case "locker":
                return "ロッカー"
            case "shower":
                return "シャワー"
            case "rental":
                return "レンタル用具"
            case "shop":
                return "売店"
            case "vending":
                return "自販機"
            case "wifi":
                return "WiFi"
            case "ac":
                return "冷暖房"
            default:
                return nil
            }
        }
    }
}

enum CourtStatus: String, Codable {
    case active = "ACTIVE"
    case inactive = "INACTIVE"
}

enum ListingPlan: String, Codable {
    case free = "FREE"
    case basic = "BASIC"
    case premium = "PREMIUM"
}
