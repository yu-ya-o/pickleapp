import SwiftUI

struct ModernEventRowView: View {
    let event: Event
    var onProfileTap: (() -> Void)? = nil

    var body: some View {
        HStack(alignment: .top, spacing: Spacing.md) {
            // Left: Creator profile image and nickname
            VStack(spacing: Spacing.xs) {
                Button(action: {
                    onProfileTap?()
                }) {
                    if let profileImageURL = event.creator.profileImageURL {
                        CachedAsyncImagePhase(url: profileImageURL) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 50, height: 50)
                                    .clipShape(Circle())
                            case .failure(_), .empty:
                                Image(systemName: "person.circle.fill")
                                    .resizable()
                                    .frame(width: 50, height: 50)
                                    .foregroundColor(.gray)
                            @unknown default:
                                EmptyView()
                            }
                        }
                    } else {
                        Image(systemName: "person.circle.fill")
                            .resizable()
                            .frame(width: 50, height: 50)
                            .foregroundColor(.gray)
                    }
                }
                .buttonStyle(.plain)

                Text(event.creator.displayName)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                    .frame(width: 50)
            }

            // Right: Date, Title, Location
            VStack(alignment: .leading, spacing: Spacing.xs) {
                // Date
                HStack(spacing: Spacing.xs) {
                    Image(systemName: "calendar")
                        .font(.caption)
                        .foregroundColor(.twitterBlue)
                    Text(event.formattedDate)
                        .font(.bodySmall)
                        .foregroundColor(.secondary)
                }

                // Title
                Text(event.title)
                    .font(.headlineMedium)
                    .foregroundColor(.primary)
                    .lineLimit(2)

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

                // Participants and status
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
        }
        .padding(.horizontal, Spacing.md)
        .padding(.vertical, Spacing.sm)
        .background(Color.white)
    }
}

// MARK: - Event Extensions
extension Event {
    var currentParticipants: Int {
        maxParticipants - availableSpots
    }
}
