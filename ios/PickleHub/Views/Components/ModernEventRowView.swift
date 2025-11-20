import SwiftUI

struct ModernEventRowView: View {
    let event: Event

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            // Header
            HStack {
                Text(event.title)
                    .font(.headlineMedium)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                Spacer()
                Text(event.skillLevelEmoji)
                    .font(.title2)
            }

            // Date & Time
            HStack(spacing: Spacing.xs) {
                Image(systemName: "calendar")
                    .font(.caption)
                    .foregroundColor(.twitterBlue)
                Text(event.formattedDate)
                    .font(.bodySmall)
                    .foregroundColor(.secondary)
            }

            // Location
            HStack(spacing: Spacing.xs) {
                Image(systemName: "mappin.circle.fill")
                    .font(.caption)
                    .foregroundColor(.twitterBlue)
                Text(event.location)
                    .font(.bodySmall)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            // Participants
            HStack(spacing: Spacing.xs) {
                Image(systemName: "person.2.fill")
                    .font(.caption)
                    .foregroundColor(.twitterBlue)
                Text("\(event.currentParticipants)/\(event.maxParticipants)人")
                    .font(.bodySmall)
                    .foregroundColor(.secondary)

                Spacer()

                // Status badge
                if event.availableSpots == 0 {
                    Text("満席")
                        .font(.labelSmall)
                        .foregroundColor(.white)
                        .padding(.horizontal, Spacing.sm)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(Color.red))
                } else if event.availableSpots <= 3 {
                    Text("残り\(event.availableSpots)席")
                        .font(.labelSmall)
                        .foregroundColor(.white)
                        .padding(.horizontal, Spacing.sm)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(Color.orange))
                }
            }
        }
        .padding(Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: CornerRadius.medium)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
        )
    }
}

// MARK: - Event Extensions
extension Event {
    var currentParticipants: Int {
        maxParticipants - availableSpots
    }
}
