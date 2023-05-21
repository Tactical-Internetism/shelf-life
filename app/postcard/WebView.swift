import SwiftUI
import WebKit
 
struct WebView: UIViewRepresentable {
 
    var url: URL
 
    func makeUIView(context: Context) -> WKWebView {
        return WKWebView()
    }
 
    func updateUIView(_ webView: WKWebView, context: Context) {
        var correctedURL = url
        if url.scheme == nil {
            correctedURL = URL(string: "http://\(url.absoluteString)")!
        }
        let request = URLRequest(url: correctedURL)
        webView.load(request)
    }
}
