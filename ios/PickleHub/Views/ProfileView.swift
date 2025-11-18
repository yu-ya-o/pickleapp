import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingSignOutAlert = false

    var body: some View {
        NavigationView {
            List {
                Section {
                    HStack(spacing: 16) {
                        // Profile Image
                        if let profileImageURL = authViewModel.currentUser?.profileImageURL {
                            AsyncImage(url: profileImageURL) { image in
                                image
                                    .resizable()
                                    .scaledToFill()
                            } placeholder: {
                                Image(systemName: "person.circle.fill")
                                    .resizable()
                            }
                            .frame(width: 60, height: 60)
                            .clipShape(Circle())
                        } else {
                            Image(systemName: "person.circle.fill")
                                .resizable()
                                .frame(width: 60, height: 60)
                                .foregroundColor(.gray)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text(authViewModel.currentUser?.name ?? "")
                                .font(.headline)
                            Text(authViewModel.currentUser?.email ?? "")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 8)
                }

                Section(header: Text("Account")) {
                    HStack {
                        Label("User ID", systemImage: "number")
                        Spacer()
                        Text(authViewModel.currentUser?.id ?? "")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section(header: Text("App Info")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }

                    HStack {
                        Text("API Server")
                        Spacer()
                        Text(Config.apiBaseURL)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Section {
                    Button(action: {
                        showingSignOutAlert = true
                    }) {
                        HStack {
                            Spacer()
                            Text("Sign Out")
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Profile")
            .alert("Sign Out", isPresented: $showingSignOutAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Sign Out", role: .destructive) {
                    authViewModel.signOut()
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
}
