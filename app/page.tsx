'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  BarChart3, 
  Database, 
  Zap, 
  Shield, 
  Smartphone,
  Globe,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: "Drag & Drop Builder",
      description: "Intuitive interface to create forms without coding",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Zap,
      title: "Instant Preview",
      description: "See your form changes in real-time as you build",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your data is safe with enterprise-grade security",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Forms that look great on all devices",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: Globe,
      title: "Easy Sharing",
      description: "Share forms with a simple link",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track form submissions and insights",
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ]

  const quickActions = [
    {
      title: "Create New Form",
      description: "Start building your first form",
      href: "/builder",
      icon: FileText,
      color: "company-button-primary",
      bgColor: "bg-primary/10",
      buttonText: "Get Started"
    },
    {
      title: "View Dashboard",
      description: "Manage your existing forms",
      href: "/dashboard",
      icon: BarChart3,
      color: "company-button-accent",
      bgColor: "bg-accent/10",
      buttonText: "Open Dashboard"
    },
    {
      title: "Database Viewer",
      description: "Inspect your stored data",
      href: "/database-viewer",
      icon: Database,
      color: "company-button-primary",
      bgColor: "bg-primary/10",
      buttonText: "View Data"
    }
  ]

  const steps = [
    {
      number: "1",
      title: "Create",
      description: "Use our drag-and-drop builder to create forms with any field type"
    },
    {
      number: "2",
      title: "Customize",
      description: "Add validation, styling, and configure field options"
    },
    {
      number: "3",
      title: "Publish",
      description: "Publish your form and share it with others"
    },
    {
      number: "4",
      title: "Collect",
      description: "Receive submissions and view analytics in your dashboard"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 company-gradient opacity-10"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Build Forms in Minutes
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Create Beautiful Forms
              <span className="block company-gradient-text">
                Without Code
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Build professional forms with our intuitive drag-and-drop interface. 
              Create, customize, and publish forms in minutes. Perfect for surveys, 
              registrations, and data collection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/builder">
                <Button size="lg" className="company-button-primary text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Start Building Now
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <p className="text-lg text-gray-600">Get started quickly with these common tasks</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card key={index} className="company-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${action.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${action.color.replace('company-button-', 'text-')}`} />
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">{action.description}</p>
                  <Link href={action.href}>
                    <Button className={`w-full ${action.color}`}>
                      {action.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">Simple 4-step process to create and publish forms</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              <div className="w-20 h-20 company-gradient rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 company-gradient transform -translate-y-1/2 z-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Form Builder?</h2>
          <p className="text-lg text-gray-600">Powerful features that make form creation simple and efficient</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="company-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 company-gradient rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">FormBuilder</span>
          </div>
          <p className="text-gray-400 mb-4">
            Create beautiful forms with our intuitive drag-and-drop interface
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <Link href="/builder" className="hover:text-white transition-colors">Builder</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/database-viewer" className="hover:text-white transition-colors">Database</Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 