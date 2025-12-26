import SwiftUI

struct SNSLinksView: View {
    let instagramUrl: String?
    let twitterUrl: String?
    let tiktokUrl: String?
    let lineUrl: String?

    var hasAnySNS: Bool {
        instagramUrl != nil || twitterUrl != nil || tiktokUrl != nil || lineUrl != nil
    }

    var body: some View {
        if hasAnySNS {
            HStack(spacing: 16) {
                if let instagram = instagramUrl, !instagram.isEmpty, let url = URL(string: instagram) {
                    Link(destination: url) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 24))
                            .foregroundColor(Color(red: 0.89, green: 0.21, blue: 0.54)) // Instagram pink/purple
                            .frame(width: 44, height: 44)
                            .background(Color(.systemGray6))
                            .clipShape(Circle())
                    }
                }

                if let twitter = twitterUrl, !twitter.isEmpty, let url = URL(string: twitter) {
                    Link(destination: url) {
                        Image(systemName: "bird.fill")
                            .font(.system(size: 20))
                            .foregroundColor(Color(red: 0.11, green: 0.63, blue: 0.95)) // Twitter blue
                            .frame(width: 44, height: 44)
                            .background(Color(.systemGray6))
                            .clipShape(Circle())
                    }
                }

                if let tiktok = tiktokUrl, !tiktok.isEmpty, let url = URL(string: tiktok) {
                    Link(destination: url) {
                        Image(systemName: "music.note")
                            .font(.system(size: 20))
                            .foregroundColor(.black)
                            .frame(width: 44, height: 44)
                            .background(Color(.systemGray6))
                            .clipShape(Circle())
                    }
                }

                if let line = lineUrl, !line.isEmpty, let url = URL(string: line) {
                    Link(destination: url) {
                        Image(systemName: "message.fill")
                            .font(.system(size: 20))
                            .foregroundColor(Color(red: 0.00, green: 0.75, blue: 0.24)) // LINE green
                            .frame(width: 44, height: 44)
                            .background(Color(.systemGray6))
                            .clipShape(Circle())
                    }
                }
            }
            .padding(.vertical, 8)
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        SNSLinksView(
            instagramUrl: "https://instagram.com/test",
            twitterUrl: "https://twitter.com/test",
            tiktokUrl: "https://tiktok.com/@test",
            lineUrl: "https://line.me/ti/p/test"
        )

        SNSLinksView(
            instagramUrl: "https://instagram.com/test",
            twitterUrl: nil,
            tiktokUrl: "https://tiktok.com/@test",
            lineUrl: nil
        )
    }
}
