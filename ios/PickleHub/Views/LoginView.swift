import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        VStack(spacing: 30) {
            Spacer()

            // App Logo/Icon
            Image(systemName: "figure.pickleball")
                .resizable()
                .scaledToFit()
                .frame(width: 120, height: 120)
                .foregroundColor(.green)

            // App Name
            Text("PickleHub")
                .font(.system(size: 48, weight: .bold))
                .foregroundColor(.primary)

            Text("ピックルボールプレイヤーとつながろう")
                .font(.headline)
                .foregroundColor(.secondary)

            Spacer()

            // Sign In Button
            Button(action: {
                Task {
                    await authViewModel.signInWithGoogle()
                }
            }) {
                HStack {
                    Image(systemName: "g.circle.fill")
                        .font(.title2)
                    Text("Googleでログイン")
                        .font(.headline)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .cornerRadius(12)
            }
            .disabled(authViewModel.isLoading)
            .padding(.horizontal, 40)

            if authViewModel.isLoading {
                ProgressView()
                    .padding()
            }

            if let errorMessage = authViewModel.errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.caption)
                    .padding(.horizontal, 40)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding()
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthViewModel())
}
