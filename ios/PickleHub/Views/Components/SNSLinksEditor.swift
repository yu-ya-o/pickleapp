import SwiftUI

struct SNSLinksEditor: View {
    @Binding var instagramUrl: String
    @Binding var twitterUrl: String
    @Binding var tiktokUrl: String
    @Binding var lineUrl: String

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            Text("SNSリンク")
                .font(.headlineSmall)
                .fontWeight(.semibold)

            // Instagram
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "camera.fill")
                        .foregroundColor(Color(red: 0.89, green: 0.21, blue: 0.54))
                    Text("Instagram")
                        .font(.bodyMedium)
                }
                TextField("https://instagram.com/username", text: $instagramUrl)
                    .textFieldStyle(.roundedBorder)
                    .autocapitalization(.none)
                    .keyboardType(.URL)
            }

            // Twitter/X
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "bird.fill")
                        .foregroundColor(Color(red: 0.11, green: 0.63, blue: 0.95))
                    Text("Twitter/X")
                        .font(.bodyMedium)
                }
                TextField("https://twitter.com/username", text: $twitterUrl)
                    .textFieldStyle(.roundedBorder)
                    .autocapitalization(.none)
                    .keyboardType(.URL)
            }

            // TikTok
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "music.note")
                        .foregroundColor(.black)
                    Text("TikTok")
                        .font(.bodyMedium)
                }
                TextField("https://tiktok.com/@username", text: $tiktokUrl)
                    .textFieldStyle(.roundedBorder)
                    .autocapitalization(.none)
                    .keyboardType(.URL)
            }

            // LINE
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "message.fill")
                        .foregroundColor(Color(red: 0.00, green: 0.75, blue: 0.24))
                    Text("LINE")
                        .font(.bodyMedium)
                }
                TextField("https://line.me/ti/p/username", text: $lineUrl)
                    .textFieldStyle(.roundedBorder)
                    .autocapitalization(.none)
                    .keyboardType(.URL)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(CornerRadius.medium)
    }
}

#Preview {
    SNSLinksEditor(
        instagramUrl: .constant(""),
        twitterUrl: .constant(""),
        tiktokUrl: .constant(""),
        lineUrl: .constant("")
    )
    .padding()
}
