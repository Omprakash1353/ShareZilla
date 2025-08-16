import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Globe,
  Linkedin,
  Mail,
  Shield,
  Twitter,
  Zap,
} from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "API", href: "#" },
    { label: "Enterprise", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
    { label: "Compliance", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/50">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="ShareZilla Logo"
                    className="w-6 h-6"
                  />
                </div>
                <span className="text-2xl">ShareZilla</span>
              </div>

              <p className="text-muted-foreground max-w-md">
                The fastest, most secure way to share files in real-time. Built
                for teams who value speed, security, and simplicity.
              </p>

              {/* Key Features */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Lightning Fast
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  <Globe className="w-3 h-3 mr-1" />
                  Global
                </Badge>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() =>
                    window.open("https://x.com/om__2003__", "_blank")
                  }
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() =>
                    window.open(
                      "https://github.com/omprakash1353/sharezilla",
                      "_blank"
                    )
                  }
                >
                  <Github className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() =>
                    window.open(
                      "linkedin.com/in/omprakash-mahto-851188215/",
                      "_blank"
                    )
                  }
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() =>
                    window.open("mailto:omprakash13053@gmail.com", "_blank")
                  }
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Links Sections */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <h5 className="text-sm font-medium mb-3">Legal</h5>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Bottom Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 ShareZilla. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <span>•</span>
              <span>99.9% uptime</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
