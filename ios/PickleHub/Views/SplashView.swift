import SwiftUI

struct SplashView: View {
    @State private var isAnimating = false

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color.twitterBlue.opacity(0.8), Color.twitterBlue],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: Spacing.lg) {
                // App Icon
                Image(systemName: "figure.pickleball")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                    .foregroundColor(.white)
                    .scaleEffect(isAnimating ? 1.0 : 0.8)
                    .opacity(isAnimating ? 1.0 : 0.5)
                    .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isAnimating)

                // App Name
                Text("PickleHub")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.white)
                    .opacity(isAnimating ? 1.0 : 0.0)
                    .animation(.easeIn(duration: 0.8).delay(0.2), value: isAnimating)

                // Tagline
                Text("ピックルボールをもっと楽しく")
                    .font(.headline)
                    .foregroundColor(.white.opacity(0.9))
                    .opacity(isAnimating ? 1.0 : 0.0)
                    .animation(.easeIn(duration: 0.8).delay(0.4), value: isAnimating)
            }
        }
        .onAppear {
            isAnimating = true
        }
    }
}

#Preview {
    SplashView()
}
