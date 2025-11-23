import SwiftUI

struct NotificationsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // カスタムタイトル
                Text("PickleHub")
                    .font(.system(size: 28, weight: .black, design: .default))
                    .italic()
                    .kerning(-0.5)
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.white)

                Divider()

                // Notifications list placeholder
                ScrollView {
                    VStack(spacing: Spacing.lg) {
                        Image(systemName: "bell.slash")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("通知はありません")
                            .font(.headlineMedium)
                            .foregroundColor(.secondary)
                        Text("新しい通知があるとここに表示されます")
                            .font(.bodyMedium)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding()
                }
            }
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

#Preview {
    NotificationsView()
        .environmentObject(AuthViewModel())
}
