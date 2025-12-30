import SwiftUI
import GoogleMaps

// MARK: - Google Map View
struct GoogleMapView: UIViewRepresentable {
    let latitude: Double
    let longitude: Double
    let title: String?

    func makeUIView(context: Context) -> GMSMapView {
        let camera = GMSCameraPosition.camera(
            withLatitude: latitude,
            longitude: longitude,
            zoom: 15.0
        )
        let mapView = GMSMapView.map(withFrame: CGRect.zero, camera: camera)

        // Add marker
        let marker = GMSMarker()
        marker.position = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        marker.title = title
        marker.map = mapView

        return mapView
    }

    func updateUIView(_ mapView: GMSMapView, context: Context) {
        // Update camera position if coordinates change
        let newCamera = GMSCameraPosition.camera(
            withLatitude: latitude,
            longitude: longitude,
            zoom: 15.0
        )
        mapView.camera = newCamera

        // Update marker
        mapView.clear()
        let marker = GMSMarker()
        marker.position = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        marker.title = title
        marker.map = mapView
    }
}

// MARK: - Preview Helper
#if DEBUG
struct GoogleMapView_Previews: PreviewProvider {
    static var previews: some View {
        GoogleMapView(
            latitude: 35.6762,
            longitude: 139.6503,
            title: "渋谷"
        )
        .frame(height: 200)
    }
}
#endif
