import SwiftUI

enum SNSPlatform {
    case instagram
    case twitter
    case tiktok
    case line

    var name: String {
        switch self {
        case .instagram: return "Instagram"
        case .twitter: return "X (Twitter)"
        case .tiktok: return "TikTok"
        case .line: return "LINE"
        }
    }

    var icon: String {
        switch self {
        case .instagram: return "camera"
        case .twitter: return "xmark"
        case .tiktok: return "music.note"
        case .line: return "message.fill"
        }
    }

    var gradient: LinearGradient {
        switch self {
        case .instagram:
            return LinearGradient(
                colors: [
                    Color(red: 131/255, green: 58/255, blue: 180/255),
                    Color(red: 253/255, green: 29/255, blue: 29/255),
                    Color(red: 252/255, green: 176/255, blue: 69/255)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .twitter:
            return LinearGradient(
                colors: [Color.black],
                startPoint: .leading,
                endPoint: .trailing
            )
        case .tiktok:
            return LinearGradient(
                colors: [Color.black],
                startPoint: .leading,
                endPoint: .trailing
            )
        case .line:
            return LinearGradient(
                colors: [Color(red: 0/255, green: 185/255, blue: 0/255)],
                startPoint: .leading,
                endPoint: .trailing
            )
        }
    }

    var textColor: Color {
        return .white
    }
}

struct SNSLinkButton: View {
    let platform: SNSPlatform
    let url: String

    var body: some View {
        Button(action: {
            if let url = URL(string: url) {
                UIApplication.shared.open(url)
            }
        }) {
            HStack {
                Image(systemName: platform.icon)
                    .font(.system(size: 18, weight: .medium))
                Text(platform.name)
                    .font(.system(size: 15, weight: .medium))
                Spacer()
                Image(systemName: "arrow.up.right.square")
                    .font(.system(size: 14))
            }
            .foregroundColor(platform.textColor)
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(platform.gradient)
            .cornerRadius(12)
        }
    }
}

#Preview {
    VStack(spacing: 12) {
        SNSLinkButton(platform: .instagram, url: "https://instagram.com")
        SNSLinkButton(platform: .twitter, url: "https://twitter.com")
        SNSLinkButton(platform: .tiktok, url: "https://tiktok.com")
        SNSLinkButton(platform: .line, url: "https://line.me")
    }
    .padding()
}
