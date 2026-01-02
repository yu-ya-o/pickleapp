import SwiftUI
import GooglePlaces

// MARK: - Location Data
struct LocationData {
    let name: String
    let address: String
    let latitude: Double
    let longitude: Double
}

// MARK: - Location Search View
struct LocationSearchView: View {
    @Binding var locationName: String
    @Binding var selectedLocation: LocationData?
    @State private var showingPlacesPicker = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Button(action: {
                showingPlacesPicker = true
            }) {
                HStack {
                    if selectedLocation == nil {
                        Text("場所を検索...")
                            .foregroundColor(.secondary)
                    } else {
                        Text(locationName)
                            .foregroundColor(.primary)
                    }
                    Spacer()
                    Image(systemName: "magnifyingglass.circle.fill")
                        .foregroundColor(.blue)
                        .font(.title2)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
            }
            .buttonStyle(.plain)

            if let location = selectedLocation {
                VStack(alignment: .leading, spacing: 4) {
                    Text("✓ \(location.name)")
                        .font(.subheadline)
                        .foregroundColor(.green)

                    Text(location.address)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 4)
            }
        }
        .sheet(isPresented: $showingPlacesPicker) {
            PlacesPickerView(selectedLocation: $selectedLocation, locationName: $locationName)
        }
    }
}

// MARK: - Places Picker View (UIKit Wrapper)
struct PlacesPickerView: UIViewControllerRepresentable {
    @Binding var selectedLocation: LocationData?
    @Binding var locationName: String
    @Environment(\.dismiss) var dismiss

    func makeUIViewController(context: Context) -> GMSAutocompleteViewController {
        let autocompleteController = GMSAutocompleteViewController()
        autocompleteController.delegate = context.coordinator

        // Filter to Japan only
        let filter = GMSAutocompleteFilter()
        filter.countries = ["JP"]
        autocompleteController.autocompleteFilter = filter

        return autocompleteController
    }

    func updateUIViewController(_ uiViewController: GMSAutocompleteViewController, context: Context) {
        // No update needed
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, GMSAutocompleteViewControllerDelegate {
        var parent: PlacesPickerView

        init(_ parent: PlacesPickerView) {
            self.parent = parent
        }

        func viewController(_ viewController: GMSAutocompleteViewController, didAutocompleteWith place: GMSPlace) {
            // Extract location data
            let locationData = LocationData(
                name: place.name ?? "",
                address: place.formattedAddress ?? "",
                latitude: place.coordinate.latitude,
                longitude: place.coordinate.longitude
            )

            parent.selectedLocation = locationData
            parent.locationName = place.name ?? ""
            parent.dismiss()
        }

        func viewController(_ viewController: GMSAutocompleteViewController, didFailAutocompleteWithError error: Error) {
            print("Error: ", error.localizedDescription)
            parent.dismiss()
        }

        func wasCancelled(_ viewController: GMSAutocompleteViewController) {
            parent.dismiss()
        }
    }
}
