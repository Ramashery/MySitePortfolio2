// SEO Enhancer for Admin Panel
// This script helps manage SEO meta tags and structured data

class SEOEnhancer {
    constructor() {
        this.baseUrl = 'https://digital-craft-tbilisi.netlify.app';
        this.defaultMeta = {
            keywords: 'web development, SEO services, Tbilisi, Georgia, website design, digital marketing, business websites',
            author: 'Digital Craft',
            ogType: 'website',
            ogSiteName: 'Digital Craft',
            ogLocale: 'en_US',
            twitterCard: 'summary_large_image'
        };
    }

    // Generate SEO-friendly title
    generateSEOTitle(title, type = 'page') {
        const brand = 'Digital Craft';
        const location = 'Tbilisi, Georgia';
        
        switch (type) {
            case 'service':
                return `${title} - Web Development Services in ${location} | ${brand}`;
            case 'portfolio':
                return `${title} - Web Design Portfolio in ${location} | ${brand}`;
            case 'blog':
                return `${title} - Web Development Blog | ${brand}`;
            case 'home':
                return `Web Development & SEO Services in ${location} | ${brand}`;
            default:
                return `${title} | ${brand}`;
        }
    }

    // Generate meta description
    generateMetaDescription(content, type = 'page', maxLength = 160) {
        let description = '';
        
        if (content && content.description) {
            description = content.description;
        } else if (content && content.subtitle) {
            description = content.subtitle;
        } else if (content && content.mainContent) {
            // Extract first paragraph from main content
            const paragraphs = content.mainContent.split('\n\n').filter(p => p.trim().length > 20);
            if (paragraphs.length > 0) {
                description = paragraphs[0].replace(/<[^>]*>/g, '').trim();
            }
        }
        
        // Add default description if none exists
        if (!description) {
            switch (type) {
                case 'service':
                    description = `Professional ${content.title || 'web development'} services in Tbilisi, Georgia. Expert solutions for your business needs.`;
                    break;
                case 'portfolio':
                    description = `View our ${content.title || 'web design'} portfolio showcasing professional websites and digital solutions in Tbilisi.`;
                    break;
                case 'blog':
                    description = `Read our latest insights on ${content.title || 'web development'} and digital marketing strategies.`;
                    break;
                default:
                    description = 'Professional web development and SEO services in Tbilisi, Georgia. We create high-performance websites for businesses.';
            }
        }
        
        // Truncate if too long
        if (description.length > maxLength) {
            description = description.substring(0, maxLength - 3) + '...';
        }
        
        return description;
    }

    // Generate structured data (Schema.org)
    generateStructuredData(content, type = 'page') {
        const baseSchema = {
            "@context": "https://schema.org",
            "url": window.location.href
        };

        switch (type) {
            case 'service':
                return {
                    ...baseSchema,
                    "@type": "Service",
                    "name": content.title || content.h1,
                    "description": this.generateMetaDescription(content, 'service'),
                    "provider": {
                        "@type": "Organization",
                        "name": "Digital Craft",
                        "url": this.baseUrl,
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Tbilisi",
                            "addressCountry": "GE"
                        }
                    },
                    "areaServed": {
                        "@type": "Country",
                        "name": "Georgia"
                    },
                    "serviceType": content.serviceType || "Web Development",
                    "price": content.price || undefined
                };

            case 'portfolio':
                return {
                    ...baseSchema,
                    "@type": "CreativeWork",
                    "name": content.title || content.h1,
                    "description": this.generateMetaDescription(content, 'portfolio'),
                    "creator": {
                        "@type": "Organization",
                        "name": "Digital Craft"
                    },
                    "dateCreated": content.dateCreated || undefined,
                    "genre": "Web Design",
                    "keywords": content.keywords || this.defaultMeta.keywords
                };

            case 'blog':
                return {
                    ...baseSchema,
                    "@type": "BlogPosting",
                    "headline": content.title || content.h1,
                    "description": this.generateMetaDescription(content, 'blog'),
                    "author": {
                        "@type": "Organization",
                        "name": "Digital Craft"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Digital Craft",
                        "url": this.baseUrl,
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${this.baseUrl}/logo.png`
                        }
                    },
                    "datePublished": content.datePublished || new Date().toISOString(),
                    "dateModified": content.dateModified || new Date().toISOString(),
                    "articleSection": content.category || "Web Development",
                    "keywords": content.keywords || this.defaultMeta.keywords
                };

            case 'home':
                return {
                    ...baseSchema,
                    "@type": "Organization",
                    "name": "Digital Craft",
                    "description": "Professional web development and SEO services in Tbilisi, Georgia",
                    "url": this.baseUrl,
                    "logo": {
                        "@type": "ImageObject",
                        "url": `${this.baseUrl}/logo.png`
                    },
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": "Tbilisi",
                        "addressCountry": "GE"
                    },
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "contactType": "customer service",
                        "availableLanguage": ["English", "Georgian", "Ukrainian", "Russian"]
                    },
                    "sameAs": [
                        this.baseUrl
                    ]
                };

            default:
                return baseSchema;
        }
    }

    // Generate Open Graph data
    generateOpenGraphData(content, type = 'page') {
        const ogData = {
            title: content.ogTitle || content.seoTitle || content.title || content.h1,
            description: content.ogDescription || this.generateMetaDescription(content, type),
            type: content.ogType || this.defaultMeta.ogType,
            url: content.ogUrl || window.location.href,
            siteName: content.ogSiteName || this.defaultMeta.ogSiteName,
            locale: content.ogLocale || this.defaultMeta.ogLocale
        };

        // Add image if available
        if (content.ogImage) {
            ogData.image = content.ogImage;
            ogData.imageWidth = '1200';
            ogData.imageHeight = '630';
            ogData.imageAlt = content.ogImageAlt || ogData.title;
        } else if (content.media && content.media.length > 0) {
            const imageUrl = content.media.find(url => !/youtube|vimeo/.test(url));
            if (imageUrl) {
                ogData.image = imageUrl;
                ogData.imageWidth = '1200';
                ogData.imageHeight = '630';
                ogData.imageAlt = content.ogImageAlt || ogData.title;
            }
        }

        return ogData;
    }

    // Generate Twitter Card data
    generateTwitterCardData(content, type = 'page') {
        const twitterData = {
            card: this.defaultMeta.twitterCard,
            title: content.twitterTitle || content.seoTitle || content.title || content.h1,
            description: content.twitterDescription || this.generateMetaDescription(content, type)
        };

        // Add image if available
        if (content.ogImage) {
            twitterData.image = content.ogImage;
            twitterData.imageAlt = content.twitterImageAlt || content.ogImageAlt || twitterData.title;
        } else if (content.media && content.media.length > 0) {
            const imageUrl = content.media.find(url => !/youtube|vimeo/.test(url));
            if (imageUrl) {
                twitterData.image = imageUrl;
                twitterData.imageAlt = content.twitterImageAlt || twitterData.title;
            }
        }

        return twitterData;
    }

    // Validate SEO data
    validateSEOData(content, type = 'page') {
        const errors = [];
        const warnings = [];

        // Check required fields
        if (!content.title && !content.h1) {
            errors.push('Missing title or H1 heading');
        }

        if (!content.description && !content.subtitle && !content.mainContent) {
            errors.push('Missing description, subtitle, or main content');
        }

        // Check content length
        if (content.description && content.description.length > 160) {
            warnings.push('Description is longer than recommended 160 characters');
        }

        if (content.title && content.title.length > 60) {
            warnings.push('Title is longer than recommended 60 characters');
        }

        // Check for keywords
        if (!content.keywords) {
            warnings.push('No keywords specified');
        }

        // Check for structured data
        if (!content.schemaJsonLd) {
            warnings.push('No structured data (Schema.org) specified');
        }

        return { errors, warnings };
    }

    // Generate SEO report
    generateSEOReport(content, type = 'page') {
        const validation = this.validateSEOData(content, type);
        const seoTitle = this.generateSEOTitle(content.title || content.h1, type);
        const metaDescription = this.generateMetaDescription(content, type);
        const structuredData = this.generateStructuredData(content, type);
        const openGraph = this.generateOpenGraphData(content, type);
        const twitterCard = this.generateTwitterCardData(content, type);

        return {
            validation,
            seoTitle,
            metaDescription,
            structuredData,
            openGraph,
            twitterCard,
            recommendations: this.generateRecommendations(validation, content, type)
        };
    }

    // Generate SEO recommendations
    generateRecommendations(validation, content, type) {
        const recommendations = [];

        if (validation.errors.length > 0) {
            recommendations.push('Fix critical errors first: ' + validation.errors.join(', '));
        }

        if (validation.warnings.length > 0) {
            recommendations.push('Consider addressing warnings: ' + validation.warnings.join(', '));
        }

        // Content-specific recommendations
        switch (type) {
            case 'service':
                if (!content.price) {
                    recommendations.push('Consider adding pricing information for better user experience');
                }
                if (!content.serviceType) {
                    recommendations.push('Specify service type for better categorization');
                }
                break;
            case 'blog':
                if (!content.category) {
                    recommendations.push('Add blog post category for better organization');
                }
                if (!content.datePublished) {
                    recommendations.push('Add publication date for better SEO');
                }
                break;
        }

        // General recommendations
        if (!content.keywords) {
            recommendations.push('Add relevant keywords for better search visibility');
        }

        if (!content.ogImage) {
            recommendations.push('Add Open Graph image for better social media sharing');
        }

        return recommendations;
    }
}

// Export for use in other scripts
window.SEOEnhancer = SEOEnhancer;

// Auto-initialize if in admin panel
if (window.location.pathname.includes('admin')) {
    window.seoEnhancer = new SEOEnhancer();
    console.log('SEO Enhancer initialized for admin panel');
}