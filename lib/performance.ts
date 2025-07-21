// Performance monitoring utilities
export const performance = {
  // Track page load performance
  trackPageLoad: (pageName: string) => {
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid SSR issues
        import('firebase/performance').then(({ getPerformance, trace }) => {
          const perf = getPerformance()
          const pageLoadTrace = trace(perf, `page_load_${pageName}`)
          pageLoadTrace.start()
          
          // Stop trace when page is fully loaded
          window.addEventListener('load', () => {
            pageLoadTrace.stop()
          })
        }).catch((error) => {
          console.log('Performance tracking not available:', error)
        })
      } catch (error) {
        console.log('Performance tracking not available:', error)
      }
    }
  },

  // Track custom events
  trackEvent: (eventName: string, attributes?: Record<string, string>) => {
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid SSR issues
        import('firebase/performance').then(({ getPerformance, trace }) => {
          const perf = getPerformance()
          const eventTrace = trace(perf, eventName)
          
          if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
              eventTrace.putAttribute(key, value)
            })
          }
          
          eventTrace.start()
        }).catch((error) => {
          console.log('Performance tracking not available:', error)
        })
      } catch (error) {
        console.log('Performance tracking not available:', error)
      }
    }
  },

  // Track API calls
  trackApiCall: (apiName: string) => {
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid SSR issues
        import('firebase/performance').then(({ getPerformance, trace }) => {
          const perf = getPerformance()
          const apiTrace = trace(perf, `api_call_${apiName}`)
          apiTrace.start()
        }).catch((error) => {
          console.log('Performance tracking not available:', error)
        })
      } catch (error) {
        console.log('Performance tracking not available:', error)
      }
    }
  },

  // Track authentication events
  trackAuthEvent: (eventType: 'login' | 'logout' | 'signup') => {
    performance.trackEvent(`auth_${eventType}`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  },

  // Track dashboard interactions
  trackDashboardEvent: (action: string) => {
    performance.trackEvent(`dashboard_${action}`, {
      timestamp: new Date().toISOString()
    })
  }
}

export default performance 