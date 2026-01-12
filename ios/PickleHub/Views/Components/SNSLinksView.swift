import SwiftUI

struct SNSLinksView: View {
    let instagramUrl: String?
    let twitterUrl: String?
    let tiktokUrl: String?
    let lineUrl: String?

    var hasAnySNS: Bool {
        (instagramUrl != nil && !instagramUrl!.isEmpty) ||
        (twitterUrl != nil && !twitterUrl!.isEmpty) ||
        (tiktokUrl != nil && !tiktokUrl!.isEmpty) ||
        (lineUrl != nil && !lineUrl!.isEmpty)
    }

    var body: some View {
        if hasAnySNS {
            VStack(spacing: 8) {
                if let instagram = instagramUrl, !instagram.isEmpty {
                    SNSLinkButton(platform: .instagram, url: instagram)
                }

                if let twitter = twitterUrl, !twitter.isEmpty {
                    SNSLinkButton(platform: .twitter, url: twitter)
                }

                if let tiktok = tiktokUrl, !tiktok.isEmpty {
                    SNSLinkButton(platform: .tiktok, url: tiktok)
                }

                if let line = lineUrl, !line.isEmpty {
                    SNSLinkButton(platform: .line, url: line)
                }
            }
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
