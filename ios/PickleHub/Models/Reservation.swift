import Foundation

struct Reservation: Codable, Identifiable, Hashable {
    let id: String
    let status: String
    let createdAt: String
    let user: User
    let eventId: String
}

// MARK: - Create Reservation Request
struct CreateReservationRequest: Codable {
    let eventId: String
}
